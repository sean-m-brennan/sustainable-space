#!/usr/bin env python3
import argparse
import os
import math
from abc import ABC
from enum import Enum

#os.environ['ETS_TOOLKIT'] = 'qt4'
#os.environ['QT_API'] = 'pyqt5'
#from traits.etsconfig.api import ETSConfig
#ETSConfig.toolkit = 'qt4'
#from mayavi import mlab

import numpy as np
from matplotlib.axes import Axes
from mpl_toolkits.mplot3d import axes3d
import matplotlib.pyplot as plt

from solar_constants import *


def cart2pol(x, y):
    rho = np.sqrt(x**2 + y**2)
    phi_star = np.arctan2(y, x)
    phi = phi_star
    #if x < 0:
    #    phi = phi_star + np.pi
    #elif y < 0:
    #    phi = phi_star - 2*np.pi
    return phi, rho


def pol2cart(phi, rho):
    return rho * np.cos(phi), rho * np.sin(phi)

####################

class Plottable(ABC):
    def adjust(self, val: float) -> float:
        raise NotImplementedError

    def compute_z_val(self, x_val: float, y_val: float) -> float:
        raise NotImplementedError

    def cartesian_sampling(self, points: int = 1024, radius: float = None, limit: float = 0., mesh: bool = True):
        cart = False
        if cart:
            depth = 3. * np.pi / 4.
            v_x = np.linspace(-depth*3, depth*3, points)
            v_y = np.linspace(-depth*3, depth*3, points)
            if mesh:
                v_x, v_y = np.meshgrid(v_x, v_y)
        else:
            points = int(points * np.pi)
            start = .75
            end = np.pi / 2.5
            if radius:
                start = limit
                end = radius
            extra = 2. * np.pi / points + 0.01
            p_y = np.linspace(0, 2. * np.pi + extra, points, endpoint=False) #[..., np.newaxis]
            p_x = np.linspace(start, end, points)
            if mesh:
                p_x, p_y = np.meshgrid(p_x, p_y)
            v_x, v_y = np.vectorize(pol2cart)(p_y, p_x)

        v_z = np.vectorize(self.compute_z_val)(v_x, v_y)

        return v_x, v_y, v_z

    def plot(self, ax: Axes, points: int = 1024, with_text: bool = False, three_d: bool = False):
        raise NotImplementedError

####################

class Lagrangian:
    class Point(str, Enum):
        L1 = 'L1'
        L2 = 'L2'
        L3 = 'L3'
        L4 = 'L4'
        L5 = 'L5'

    def __init__(self, m_1: float, m_2: float):
        # normally q < 1, but that does not converge
        q = m_1 / m_2 if m_1 > m_2 else m_2 / m_1
        # normally xes * (m_1 * m_2), but reduces numerical range to indistinguishable
        # also x1 negative, thus centered on zero, for computability
        self.x1 = -1 / (q + 1)
        self.x2 = q / (q + 1)


    def coords(self, which: Point):
        """Lagrangian point coordinates in unit distance"""
        def _find(x_low, x_up):
            # newtonian solver
            xi = 0
            while abs(x_low - x_up) > 1e-10:
                xi = 0.5 * (x_low + x_up)
                if self.roche_derivative(xi) > 0.:
                    x_low = xi
                else:
                    x_up = xi
            return xi
        if which == self.Point.L1:
            return _find(self.x1 * 0.99, self.x2 * 0.99), 0.
        if which == self.Point.L2:
            return _find(self.x2 * 1.01, 2), 0.
        if which == self.Point.L3:
            return _find(-2, self.x1 * 1.01), 0.
        if which == self.Point.L4:
            return 0.5 * (self.x1 + self.x2), np.sqrt(3) / 2 * abs(self.x1 - self.x2)
        if which == self.Point.L5:
            return 0.5 * (self.x1 + self.x2), -(np.sqrt(3) / 2 * abs(self.x1 - self.x2))

    def roche_potential(self, x: float, y: float):
        return (-self.x2 / np.sqrt(np.power(x - self.x1, 2) + np.power(y, 2))) \
            + (self.x1 / np.sqrt(np.power(x - self.x2, 2) + np.power(y, 2))) \
            - 0.5 * (np.power(x, 2) + np.power(y, 2))

    def roche_derivative(self, x: float) -> float:
        return +self.x2 / np.power(x - self.x1, 2) * np.sign(x - self.x1) - \
            self.x1 / np.power(x - self.x2, 2) * np.sign(x - self.x2) - x


class RocheLagrangian(Plottable):
    def __init__(self, m_1: float, m_2: float, dist: float):
        super().__init__()
        self.lagrange = Lagrangian(m_1, m_2)
        self.dist = dist

        self.barycenter = self.adjust(m_2 / (m_1 + m_2))
        self.M1 = -self.barycenter, 0
        self.M2 = self.adjust(1) - self.barycenter, 0

        self.L1 = tuple(map(self.adjust, self.lagrange.coords(Lagrangian.Point.L1)))
        self.L2 = tuple(map(self.adjust, self.lagrange.coords(Lagrangian.Point.L2)))
        self.L3 = tuple(map(self.adjust, self.lagrange.coords(Lagrangian.Point.L3)))
        self.L4 = tuple(map(self.adjust, self.lagrange.coords(Lagrangian.Point.L4)))
        self.L5 = tuple(map(self.adjust, self.lagrange.coords(Lagrangian.Point.L5)))

        self.phi_L1 = self.lagrange.roche_potential(*self.lagrange.coords(Lagrangian.Point.L1))
        self.phi_L2 = self.lagrange.roche_potential(*self.lagrange.coords(Lagrangian.Point.L2))
        self.phi_L3 = self.lagrange.roche_potential(*self.lagrange.coords(Lagrangian.Point.L3))
        self.phi_L4_5 = self.lagrange.roche_potential(*self.lagrange.coords(Lagrangian.Point.L4))

    def adjust(self, a: float) -> float:
        a *= self.dist
        return a

    @staticmethod
    def alter_raw_z(z_val: float) -> float:
        return math.log10(math.log10(math.fabs(z_val)))

    def compute_z_val(self, x_val: float, y_val: float) -> float:
        z_val = self.lagrange.roche_potential(x_val, y_val)
        return self.alter_raw_z(z_val)

    def plot(self, ax: Axes, points: int = 1024, with_text: bool = True, three_d: bool = False, fill: bool = True):
        if three_d:
            points //= 8

        scale = 1
        limit = 0.
        radius = None
        if three_d:
            scale = -1.5
            limit = .5
            radius = 1.725
        v_x, v_y, v_z = self.cartesian_sampling(points, radius=radius, limit=limit, mesh=False)
        v_x = np.vectorize(self.adjust)(v_x)
        v_y = np.vectorize(self.adjust)(v_y)
        v_z = np.vectorize(lambda z: self.adjust(scale * (z if z < limit else limit) - .725))(v_z)

        print('Max', np.max(v_z))
        print('Min', np.min(v_z))
        print('Diameter', np.sqrt((np.min(v_x) - np.max(v_x))**2 + (np.min(v_y) - np.max(v_y))**2))
        print('X',v_x.shape)
        print('Y',v_y.shape)
        print('Z',v_z.shape)

        colors = ['w', 'r', 'b', 'g', 'c']
        lines = sorted([(np.min(v_z), colors[0]),
                        (self.alter_raw_z(self.phi_L1), colors[1]),
                        (self.alter_raw_z(self.phi_L2), colors[2]),
                        (self.alter_raw_z(self.phi_L3), colors[3]),
                        (self.alter_raw_z(self.phi_L4_5*1.0001), colors[4])], key=lambda x: x[0])
        levels = [x[0] for x in lines]
        #levels = [np.min(v_z), phi_l1, phi_l2, phi_l3, phi_l4, np.max(v_z)*.99]

        color_seq = 'gist_gray' #'binary'
        pt_color = 'k' #'k' 'w'

        # FIXME displace on x-axis to center on the sun, not barycenter

        if three_d:
            ax.plot_surface(v_x, v_y, v_z, cmap="viridis_r", rstride=1, cstride=1, alpha=0.5)
            ax.plot_surface(v_x, v_y, -v_z, cmap="viridis", rstride=1, cstride=1, alpha=0.5)
        else:
            if fill:
                ax.contourf(v_x, v_y, v_z, cmap=color_seq, antialiased=True, alpha=0.5)
            ax.contour(v_x, v_y, v_z, levels, colors=colors, linestyles="solid", linewidths=1, antialiased=True, alpha=0.75)

            if with_text:
                ax.text(*self.L1, 'L1', color=pt_color, horizontalalignment='center', verticalalignment='center')
                ax.text(*self.L2, 'L2', color=pt_color, horizontalalignment='center', verticalalignment='center')
                ax.text(*self.L3, 'L3', color=pt_color, horizontalalignment='center', verticalalignment='center')
                ax.text(*self.L4, 'L4', color=pt_color, horizontalalignment='center', verticalalignment='center')
                ax.text(*self.L5, 'L5', color=pt_color, horizontalalignment='center', verticalalignment='center')
                ax.plot(*self.M1, "b.", label="$m_1$")
                ax.plot(*self.M2, "w,", label="$m_2$")
                ax.plot(0,0, pt_color + '+')
        ax.set_axis_off()
        ax.set_aspect("equal")

####################

def grav_potential(mass: float, radius: float, x: float, y: float, limit: float = 1e-9) -> float:
    dist = math.sqrt(x ** 2 + y ** 2)
    if (radius is not None and dist <= radius) or dist == 0:
        return limit
    return -G * mass / dist ** 2


class GravitationalPotential(Plottable):
    def __init__(self, mass: float, radius: float = None):
        super().__init__()
        self.mass = mass
        self.dist = 5e7
        self.radius = radius

    def adjust(self, a: float) -> float:
        return a * self.dist

    def compute_z_val(self, x_val: float, y_val: float) -> float:
        return grav_potential(self.mass, self.radius, self.adjust(x_val), self.adjust(y_val))

    def plot(self, ax: Axes, points: int = 1024, radius: float = None, with_text: bool = False, three_d: bool = False):
        if three_d:
            points //= 8
        v_x, v_y, v_z = self.cartesian_sampling(points, radius=radius)
        v_x = np.vectorize(self.adjust)(v_x)
        v_y = np.vectorize(self.adjust)(v_y)
        scale = 1
        if three_d:
            scale = -10
        v_z = np.vectorize(lambda z: self.adjust(scale * math.log10(math.fabs(math.log10(math.fabs(z))))))(v_z)

        print('Max', np.max(v_z))
        print('Min', np.min(v_z))
        print('Diameter', np.sqrt((np.min(v_x) - np.max(v_x))**2 + (np.min(v_y) - np.max(v_y))**2))

        #mlab.surf(v_x, v_y, v_z, warp_scale='auto')
        color_seq = 'YlOrRd' #'hot' #'gist_gray' #'binary'
        if three_d:
            ax.plot_surface(v_x, v_y, v_z, cmap="viridis_r", rstride=1, cstride=1)
        else:
            ax.contourf(v_x, v_y, v_z, cmap=color_seq, antialiased=True)
        ax.set_axis_off()
        ax.set_aspect("equal")

####################

def plot_solar_system(directory: str = os.getcwd(), display: bool = False):
    size = [100, 100]
    res = 655
    if display:
        size = [5, 5]
        res = 300

    three_dim = False
    # max size is 2^16 (65536) in each direction
    fig = plt.figure(figsize=size, dpi=res, tight_layout=True)
    if three_dim:
        #mlab.figure(bgcolor=(1,1,1))
        ax = fig.add_subplot(111, projection='3d')
    else:
        ax = fig.add_subplot(111)

    gp = GravitationalPotential(Sun.mass, Sun.radius)
    #gp.plot(ax, points=100, radius=180, three_d=three_dim)

    for planet in Planets:
        rl = RocheLagrangian(planet.orbits.mass, planet.mass, planet.semimajor)
        print('%s:' % planet.name)
        print('  %s: (%f, %f)' % (planet.orbits.name, *rl.M1))
        print('  %s: (%f, %f)' % (planet.name, *rl.M2))
        print('  L1: (%f, %f) phi=%f' % (*rl.L1, rl.phi_L1))
        print('  L2: (%f, %f) phi=%f' % (*rl.L2, rl.phi_L2))
        print('  L3: (%f, %f) phi=%f' % (*rl.L3, rl.phi_L3))
        print('  L4: (%f, %f) phi=%f' % (*rl.L4, rl.phi_L4_5))
        print('  L5: (%f, %f) phi=%f' % (*rl.L5, rl.phi_L4_5))
        rl.plot(ax, points=500, with_text=display, three_d=three_dim, fill=True)

    # for satellite in Satellites  # FIXME displace on x-axis

    fig.tight_layout()
    #plt.gca().set_position([0, 0, 1, 1])
    if display:
        try:
            plt.show()
            #mlab.show()
        except KeyboardInterrupt:
            plt.close()
            print()
    else:
        filepath = os.path.join(directory, "solar_system.svg")
        plt.savefig(filepath, bbox_inches='tight', pad_inches=0)
        print("Saved to %s" % filepath)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog=os.path.basename(__file__),
        description='Plot solar system Lagrangians and Roche potentials')
    parser.add_argument('-C', '--directory', type=str, default=os.getcwd(), help='Directory to save plot')
    parser.add_argument('--display', action='store_true', help='Display plot (does not save)')
    args = parser.parse_args()

    plot_solar_system(args.directory, args.display)
