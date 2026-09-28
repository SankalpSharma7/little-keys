import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let input='';
for await(const chunk of process.stdin) input+=chunk;
const shas=[...new Set(input.trim().split('\n').filter(Boolean).map(line=>line.split(/\s+/)[1]).filter(sha=>sha&&!/^0+$/.test(sha)))];
for(const sha of shas){
  const path=mkdtempSync(join(tmpdir(),'little-keys-push-'));
  try{
    // Test the pushed commit, not a possibly different dirty working tree.
    const archive=execFileSync('git',['archive',sha],{maxBuffer:20*1024*1024});
    execFileSync('tar',['-x','-C',path],{input:archive});
    execFileSync('npm',['test'],{cwd:path,stdio:'inherit'});
    execFileSync(process.execPath,['scripts/build.mjs'],{cwd:path,stdio:'inherit'});
  } finally { rmSync(path,{recursive:true,force:true}); }
}
