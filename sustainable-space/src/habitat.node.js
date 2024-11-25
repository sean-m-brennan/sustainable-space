#!/usr/bin/env node

// TODO convert for use in webpage
import {plot} from "nodeplotlib"

const radii = [100, 200, 500, 1000, 2000, 5000, 10000]  // meters to center
const x_ = radii.map(r_i => (4 * Math.PI * r_i * r_i) / 4046.86)  // hectares
const y_g = radii.map(r_i => Math.sqrt(9.8 * r_i))
const y_g2 = radii.map(r_i => Math.sqrt(4.9 * r_i))
const y_g3 = radii.map(r_i => Math.sqrt(3.267 * r_i))
const y_g6 = radii.map(r_i => Math.sqrt(1.633 * r_i))

plot([
        {x: radii, y: y_g, type: 'line', name: '1 G', xaxis: 'x2'},
        {x: x_, y: y_g2, type: 'line', name: '1/2 G'},
        {x: x_, y: y_g3, type: 'line', name: '1/3 G'},
        {x: x_, y: y_g6, type: 'line', name: '1/6 G'},
    ],
    {
        xaxis: {title: 'Acres', type: 'log', gridwidth: 3},
        yaxis: {title: 'Angular velocity (m/s)', type: 'log'},
        xaxis2: {title: 'Meters radius', type: 'log', overlaying: 'x', side: 'top', gridwidth: 1, gridcolor: '#999999'},
    }
)
// Note scale invariance
