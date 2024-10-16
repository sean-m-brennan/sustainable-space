#!/usr/bin/env python
# -*- coding: utf-8 -*-

import math
from matplotlib import pyplot as plt

r = [10, 20, 50, 100, 200] #, 500, 1000, 2000, 5000]  # meters to center
x = [(4 * math.pi * r_i * r_i) / 4046.86 for r_i in r]  # hectares
y_g = [math.sqrt(9.8 * r_i) for r_i in r]
y_g2 = [math.sqrt(4.9 * r_i) for r_i in r]
y_g3 = [math.sqrt(3.267 * r_i) for r_i in r]
y_g6 = [math.sqrt(1.633 * r_i) for r_i in r]

plt.figure(figsize=(10, 5))
plt.plot(x, y_g)
plt.xlabel('Acres')
plt.ylabel("Velocity (m/s)")
plt.plot(x, y_g2)
plt.plot(x, y_g3)
plt.plot(x, y_g6)
plt.show()
