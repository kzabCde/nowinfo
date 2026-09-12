import {readFileSync,writeFileSync} from 'node:fs';
import {feature} from 'topojson-client';
import {geoNaturalEarth1,geoPath,geoGraticule10} from 'd3-geo';
const topology=JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json',import.meta.url)));
const land=feature(topology,topology.objects.land);
const projection=geoNaturalEarth1().translate([400,190]).scale(147);
const path=geoPath(projection).digits(1);
const centers={'north-america':[-105,40],'latin-america':[-63,-15],europe:[12,50],africa:[17,2],'middle-east':[47,28],asia:[108,37],oceania:[139,-26]};
writeFileSync(new URL('../lib/world-map.json',import.meta.url),JSON.stringify({land:path(land),grid:path(geoGraticule10()),centers:Object.fromEntries(Object.entries(centers).map(([key,coords])=>[key,projection(coords).map(n=>Math.round(n))]))}));
