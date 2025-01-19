from __future__ import print_function, division
from PyAstronomy import pyasl
import numpy as np
import matplotlib.pylab as plt

x, y = np.linspace(-1.5, 2, 300), np.linspace(-1.6, 1.6, 300)
xx, yy = np.meshgrid(x, y)
# Coordinates in orbital plain
z = 0

# Mass ratio
q = 0.2
#q = 0.012  # earth/moon
barycenter = q / (1 + q)

# Get dimensional values of Roche potential
p = pyasl.rochepot_dl(xx, yy, z, q)

# Positions (and potentials) of Lagrange points
l1, l1pot = pyasl.get_lagrange_1(q)
l2, l2pot = pyasl.get_lagrange_2(q)
l3, l3pot = pyasl.get_lagrange_3(q)
l4, l5 = pyasl.get_lagrange_4(), pyasl.get_lagrange_5()
l4pot = pyasl.rochepot_dl(l4[0], l4[1], l4[2], q)
l5pot = pyasl.rochepot_dl(l5[0], l5[1], l5[2], q)


print("Effective (dimensionless) radii of first and second mass")
print("According to the approximation of Eggleton 1983:")
r1eff = pyasl.roche_lobe_radius_eggleton(q, 1)
r2eff = pyasl.roche_lobe_radius_eggleton(q, 2)
print("    Reff1: %5.3f" % r1eff)
print("    Reff2: %5.3f" % r2eff)
print()
print("Roche volume and effective radius from Monte Carlo integration:")
mcvol1 = pyasl.roche_vol_MC(q, 1)
mcvol2 = pyasl.roche_vol_MC(q, 2)
print("    MC Roche lobe volume 1: %6.4f +/- %6.4f" % (mcvol1[0:2]))
print("    MC Roche lobe volume 2: %6.4f +/- %6.4f" % (mcvol2[0:2]))
print("    MC effective radius 1: %6.4f +/- %6.4f" % (mcvol1[2:]))
print("    MC effective radius 2: %6.4f +/- %6.4f" % (mcvol2[2:]))

#levels = [l5pot*1.02, l3pot, l2pot, l1pot]
levels = [l5pot, l3pot, l2pot, l1pot]
print(levels)
angle = np.linspace( 0 , 2 * np.pi , 150 )

plt.contour(p, sorted(levels), colors=['g', 'c', 'b', 'r'], extent=[-1.5, 2, -1.6, 1.6])
plt.text(l1, 0, 'L1', horizontalalignment='center', verticalalignment='center')
plt.text(l2, 0, 'L2', horizontalalignment='center', verticalalignment='center')
plt.text(l3, 0, 'L3', horizontalalignment='center', verticalalignment='center')
plt.text(l4[0], l4[1], 'L4', horizontalalignment='center', verticalalignment='center')
plt.text(l5[0], l5[1], 'L5', horizontalalignment='center', verticalalignment='center')
plt.text(0, 0, 'M1', horizontalalignment='center', verticalalignment='center')
plt.text(1, 0, 'M2', horizontalalignment='center', verticalalignment='center')
plt.text(barycenter, 0, '+', horizontalalignment='center', verticalalignment='center')
plt.plot( mcvol1[2:][0] * np.cos(angle), mcvol1[2:][0] * np.sin(angle), color="black")
plt.plot( 1 + mcvol2[2:][0] * np.cos(angle), mcvol2[2:][0] * np.sin(angle), color="black")
plt.axis("equal")
plt.axis("off")
plt.show()
