import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../src/utils/yamada.js',import.meta.url),'utf8')
const {MODES,conversations,memory,addMemory}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
const old={id:'old-person',name:'A',avatarId:'photo-id',friendScore:70,communication:{relationshipStage:7,stageChecks:{7:[true]},conversationLog:[{id:'old',date:'2026-09-01',topics:'old topic',theirResponse:'old reply'}]},notes:{commonTopics:'common',lifeStory:{childhood:'retained'},entries:[{id:'note',text:'retained'}]},photos:[{id:'photo2'}],events:[{id:'event',text:'retained'}]}
const before=structuredClone(old)
const next=addMemory(old,' new memory ','2026-09-24','new')
assert.deepEqual(old,before,'updates must not mutate the old record')
assert.equal(next.friendScore,70)
assert.equal(next.communication.relationshipStage,7)
assert.deepEqual(next.communication.stageChecks,old.communication.stageChecks)
for(const key of ['notes','photos','events','avatarId'])assert.deepEqual(next[key],old[key])
assert.deepEqual(next.communication.conversationLog[1],old.communication.conversationLog[0])
assert.equal(memory(next),'new memory')
assert.equal(memory({...next,yamada:{remember:'promise'}}),'promise')
assert.equal(addMemory(next,'   ','2026-09-24','empty'),next)
const earlier=addMemory(next,'backdated','2026-08-20','earlier')
assert.equal(memory(earlier),'new memory')
assert.equal(earlier.lastInteractionDate,'2026-09-24')
assert.deepEqual(conversations({communication:{conversationLog:null}}),[])
assert.equal(memory({notes:{commonTopics:'remember'}}),'remember')
assert.equal(new Set(MODES.map(x=>x.id)).size,3)
assert.ok(MODES.every(x=>x.title&&x.voice&&x.note))
const backup={format:'intimate-backup',version:2,self:{name:'self',practice:{day:365,pins:['trust']},yamadaMode:'friends'},people:[next],assets:{}}
assert.deepEqual(JSON.parse(JSON.stringify(backup)),backup)
for(const file of ['SelfPage.jsx','SelfSettings.jsx','MainListCommunication.jsx','CommunicationPersonPage.jsx']){
  const code=readFileSync(new URL('../src/components/'+file,import.meta.url),'utf8')
  assert.ok(!/from ['"].*(friendLogic|conversationFlow|stageGuidance|hanshengCorpus|selfPractice)/.test(code),file+' must not load old coaching systems')
}
console.log('PASS: legacy data preservation, blank input, dates, pinned memory, modes, backup, removed coaching dependencies')
