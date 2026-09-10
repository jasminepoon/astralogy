import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {constellationChart} from '../dist/constellation-preview.js';
const patterns=JSON.parse(fs.readFileSync(new URL('../dist/constellations.json',import.meta.url))).features;
const stars=JSON.parse(fs.readFileSync(new URL('../dist/stars.json',import.meta.url))).features;
test('Centaurus keeps every source segment and equal horizontal/vertical scale',()=>{
 const lines=patterns.find(p=>p.id==='Cen').geometry.coordinates;
 const selected=stars.find(s=>s.id===68702).geometry.coordinates;
 const c=constellationChart(lines,selected);
 assert.equal(c.segments.length,15);
 assert.ok(c.stars.length>10);
 const expected=lines.flatMap(l=>l.slice(1).map((b,i)=>[l[i],b]));
 expected.forEach(([a,b],i)=>{const pa=c.project(a),pb=c.project(b),[sa,sb]=c.segments[i];assert.ok(Math.abs(Math.hypot(sa[0]-sb[0],sa[1]-sb[1])/Math.hypot(pa[0]-pb[0],pa[1]-pb[1])-c.scale)<1e-8);});
});
test('RA wrap does not tear the chart; north is up and east is left',()=>{
 const c=constellationChart([[[359,0],[0,0],[1,0]],[[0,-1],[0,1]]],[0,0]);
 assert.ok(Math.abs(c.segments[0][1][0]-c.segments[0][0][0])<120);
 assert.ok(c.segments[0][0][0]>c.segments[0][1][0]);
 assert.ok(c.segments[2][0][1]>c.segments[2][1][1]);
});
test('all bundled constellations fit without missing source segments',()=>{
 for(const p of patterns){const lines=p.geometry.coordinates,c=constellationChart(lines,lines[0][0]);
 assert.equal(c.segments.length,lines.reduce((n,l)=>n+l.length-1,0),p.id);
 for(const [x,y] of [...c.stars,c.selected]){assert.ok(Number.isFinite(x)&&Number.isFinite(y),p.id);assert.ok(x>=19.99&&x<=250.01&&y>=19.99&&y<=170.01,p.id);}}
});
test('a selected star without line data remains visible',()=>{
 const c=constellationChart([],[-170,80]);assert.equal(c.segments.length,0);assert.deepEqual(c.selected,[135,95]);
});
