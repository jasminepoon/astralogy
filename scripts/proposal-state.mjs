import {Experiment,orbitalElements,G} from '../dist/physics.js';
let raw='';for await(const chunk of process.stdin)raw+=chunk;
try {
 const s=JSON.parse(raw),x=Experiment.fromSnapshot(s);
 if(!x.companion)throw Error('Binary required');
 console.log(JSON.stringify({snapshot:x.snapshot(),initialElements:orbitalElements(x.initial),circularSpeed:Math.sqrt(G*(1+x.mass)/4),circularPeriod:x.period}));
}catch { process.exit(1); }
