// A north-up, east-left stereographic catalogue chart, independent of ship pose.
const radians = Math.PI / 180;
const vector = ([ra, dec]) => [Math.cos(dec*radians)*Math.cos(ra*radians), Math.cos(dec*radians)*Math.sin(ra*radians), Math.sin(dec*radians)];
const dot = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0);

export function constellationChart(lines, selected, width=270, height=190, additionalStars=[]) {
  const vertices = [...new Map(lines.flat().map(p=>[p.join(','),p])).values()];
  const reference = [...vertices,...additionalStars];if(!reference.length)reference.push(selected);
  const sum = reference.map(vector).reduce((a,b)=>a.map((x,i)=>x+b[i]),[0,0,0]);
  const length = Math.hypot(...sum);
  const center = length>1e-9 ? sum.map(x=>x/length) : vector(selected);
  const ra = Math.atan2(center[1],center[0]), dec = Math.asin(center[2]);
  const east = [-Math.sin(ra),Math.cos(ra),0];
  const north = [-Math.sin(dec)*Math.cos(ra),-Math.sin(dec)*Math.sin(ra),Math.cos(dec)];
  const project = p => { const v=vector(p), denominator=1+dot(center,v); return denominator>1e-8 ? [-2*dot(east,v)/denominator,2*dot(north,v)/denominator] : null; };
  const projected = [...vertices,...additionalStars,selected].map(project).filter(Boolean);
  const xs=projected.map(p=>p[0]), ys=projected.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  // One scale for both axes: fitting the card must never squash the pattern.
  const scale=Math.min((width-40)/Math.max(maxX-minX,.01),(height-40)/Math.max(maxY-minY,.01));
  const map=p=>{const q=project(p);return q ? [width/2+(q[0]-(minX+maxX)/2)*scale,height/2-(q[1]-(minY+maxY)/2)*scale] : null;};
  const segments=[];
  for(const line of lines) for(let i=1;i<line.length;i++){const a=map(line[i-1]),b=map(line[i]);if(a&&b)segments.push([a,b]);}
  return {width,height,scale,segments,stars:vertices.map(map).filter(Boolean),selected:map(selected),catalogue:additionalStars.map(map),project};
}

export function renderConstellationPreview(container,{pattern,coordinates,id,name}) {
  const chart=constellationChart(pattern?.geometry.coordinates??[],coordinates);
  const ns='http://www.w3.org/2000/svg';
  const node=(tag,attributes)=>{const el=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));return el;};
  const svg=node('svg',{viewBox:`0 0 ${chart.width} ${chart.height}`,role:'img','aria-label':`${name} catalogue reference, north up and east left. Selected HIP ${id} in amber. Not aligned to the ship view.`});
  for(const [a,b] of chart.segments)svg.append(node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#729db6','stroke-width':1.2}));
  for(const [cx,cy] of chart.stars)svg.append(node('circle',{cx,cy,r:2.5,fill:'#e9edf4'}));
  if(chart.selected){const [cx,cy]=chart.selected;svg.append(node('circle',{cx,cy,r:7,fill:'none',stroke:'#f1c58d','stroke-width':1.2}),node('circle',{cx,cy,r:3.7,fill:'#f1c58d'}));}
  const title=document.createElement('strong');title.textContent=name+' · catalogue reference';
  const orientation=document.createElement('small');orientation.textContent='North up · east left';
  const label=document.createElement('small');label.textContent=chart.segments.length?'Selected star in amber · not a position fix':'No line pattern available · selected star in amber';
  container.replaceChildren(title,orientation,svg,label);container.hidden=false;
}

export function renderConstellationAtlas(container,{lines,stars,name}){
 const chart=constellationChart(lines,stars[0].geometry.coordinates,600,360,stars.map(s=>s.geometry.coordinates));
 const ns='http://www.w3.org/2000/svg',node=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
 const svg=node('svg',{viewBox:'0 0 600 360',role:'img','aria-label':`${name}: complete available Earth-reference pattern and ${stars.length} catalogue stars. North up, east left.`});
 for(const [a,b] of chart.segments)svg.append(node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#7099b1','stroke-width':1.2}));
 chart.catalogue.forEach((p,i)=>{if(!p)return;const dot=node('circle',{cx:p[0],cy:p[1],r:Math.max(1.6,3.5-stars[i].properties.mag*.25),fill:'#e5edf4'}),title=node('title',{});title.textContent=`HIP ${stars[i].id}`;dot.append(title);svg.append(dot);});
 const label=document.createElement('p');label.textContent=name+' · Earth-reference chart · north up / east left';container.replaceChildren(label,svg);
}
