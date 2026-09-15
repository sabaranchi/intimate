// Convert the user-provided training text into searchable app data.
// Usage: node scripts/import-hansheng.mjs <source.txt>
import { readFileSync, writeFileSync } from 'node:fs'
const source = readFileSync(process.argv[2], 'utf8').replace(/\r/g, '')
const scenes = [...source.matchAll(/^\*\*(\d+)｜([^\n]+?)\*\*\n([\s\S]*?)(?=^\*\*\d+｜|^#|$(?![\s\S]))/gm)].map(m => ({id:`scene-${m[1]}`, number:Number(m[1]), title:m[2], text:m[3].trim(), category:Number(m[1])<=20?'会話・場づくり':Number(m[1])<=40?'人脈・リーダー':Number(m[1])<=60?'交渉・商売':Number(m[1])<=75?'事業・組織':Number(m[1])<=90?'恋愛・魅力':'メンタル・危機対応'}))
const section = (from, to) => source.slice(source.indexOf(from), source.indexOf(to)).trim()
const templates = [...section('# Ⅱ.', '# Ⅲ.').matchAll(/^(\d+)\. ([^：\n]+)：(.+)$/gm)].map(m=>({id:`template-${m[1]}`,number:Number(m[1]),title:m[2],text:m[3]}))
const phases = [...source.matchAll(/^## Phase (\d+)　Day(\d+)〜(\d+)　(.+)$/gm)].map(m=>({id:Number(m[1]),start:Number(m[2]),end:Number(m[3]),title:m[4]}))
const days = [...source.matchAll(/^Day(\d+)　(.+)$/gm)].map(m=>({id:Number(m[1]),text:m[2].trim()}))
days.push({id:365,text:'去年の自分なら怖くてやらなかったが、今なら普通にできることを全部書く。'})
const guides = [['network','人脈を育てる','# Ⅲ.','# Ⅳ.'],['date','会話とデート','# Ⅳ.','# Ⅴ.'],['business','12週間の事業練習','# Ⅴ.','# Ⅵ.'],['presence','声・表情・身だしなみ','# Ⅵ.','# Ⅶ.']].map(([id,title,from,to])=>({id,title,text:section(from,to).split('\n').slice(1).join('\n').trim()}))
if(scenes.length!==100 || templates.length!==50 || phases.length!==13 || days.length!==365 || new Set(days.map(d=>d.id)).size!==365) throw Error(`Incomplete source: ${scenes.length} scenes, ${templates.length} templates, ${phases.length} phases, ${days.length} days`)
writeFileSync(new URL('../src/utils/hanshengCorpus.json',import.meta.url),JSON.stringify({scenes,templates,phases,days,guides},null,2)+'\n')
console.log('Imported: 100 scenes / 50 templates / 13 phases / 365 tasks / 4 guides')
