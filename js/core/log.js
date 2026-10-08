'use strict';
const LOG_LIMIT=300;
const LOG_ENTRIES=[];
function gcLog(type,message,data=null){
 const entry={time:new Date().toISOString(),type:String(type||'info'),message:String(message||''),data:data??null};
 LOG_ENTRIES.push(entry);if(LOG_ENTRIES.length>LOG_LIMIT)LOG_ENTRIES.splice(0,LOG_ENTRIES.length-LOG_LIMIT);
 if(entry.type==='error'&&typeof console!=='undefined'&&console.error)console.error('[GrayCrown]',entry.message,entry.data??'');
 else if(entry.type==='warn'&&typeof console!=='undefined'&&console.warn)console.warn('[GrayCrown]',entry.message,entry.data??'');
 return entry
}
function getLogs(type=null){return type?LOG_ENTRIES.filter(e=>e.type===type):LOG_ENTRIES.slice()}
function clearLogs(){LOG_ENTRIES.length=0}
if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
 window.addEventListener('error',e=>gcLog('error',e.message||'window error',{source:e.filename,line:e.lineno,col:e.colno}));
 window.addEventListener('unhandledrejection',e=>gcLog('error','Unhandled promise rejection',{reason:String(e.reason)}));
}
GC.Log={log:gcLog,info:(m,d)=>gcLog('info',m,d),warn:(m,d)=>gcLog('warn',m,d),error:(m,d)=>gcLog('error',m,d),get:getLogs,clear:clearLogs,entries:LOG_ENTRIES};
