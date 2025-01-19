from typing import Union

G = 6.6743015e-11

class Celestial:
    def __init__(self, name: str, mass: float, radius: float, semimajor: float, orbits: Union['Celestial', None]):
        self.name = name
        self.mass = mass  # kg
        self.radius = radius  # km
        self.semimajor = semimajor  # km to body it orbits
        self.orbits = orbits

    @property
    def parent(self):
        return self.orbits.name


Sun = Celestial("Sun", 1.9884e30, 695700., 0., None)

Mercury = Celestial("Mercury", 0.33010e24, 2439.7, 57.909e6, Sun)
Venus = Celestial("Venus", 4.8673e24, 6051.8, 108.210e6, Sun)
Earth = Celestial("Earth", 5.974e24, 6371., 149.59887e6, Sun)
Mars = Celestial("Mars", 0.64169e24, 3389.5, 227.956e6, Sun)
Jupiter = Celestial("Jupiter", 1898.13e24, 71492., 778.479e6, Sun)
Saturn = Celestial("Saturn", 568.32e24, 58232., 1432.041e6, Sun)
Uranus = Celestial("Uranus", 86.811e24, 25362., 2867.043e6, Sun)
Neptune = Celestial("Neptune", 102.409e24, 24622., 4514.953e6, Sun)
Pluto = Celestial("Pluto", 0.01303e24, 1188., 5869.656e6, Sun)
Planets = [Pluto, Neptune, Uranus, Saturn, Jupiter, Mars, Earth, Venus, Mercury]

Moon = Celestial("Moon", 0.007348e24, 1737.4, 38.44e6, Earth)
Satellites = [Moon]
