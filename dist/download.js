const button=document.querySelector('#get');
const statusLine=document.querySelector('#status');
function save(url,name){
  const link=document.createElement('a');
  link.href=url; link.download=name;
  document.body.append(link); link.click(); link.remove();
}
button.addEventListener('click',async()=>{
  if(location.protocol==='file:'){save('../../Build/Redline-Mods-Windows-x64.zip','Redline-Mods-Windows-x64.zip');return;}
  button.disabled=true;
  try{
    statusLine.textContent='Подготавливаем архив…';
    const response=await fetch('download.json');
    if(!response.ok)throw Error();
    const info=await response.json();
    const bytes=new Uint8Array(info.size);
    let offset=0;
    for(const part of info.parts){
      const res=await fetch(part);
      if(!res.ok)throw Error();
      const data=new Uint8Array(await res.arrayBuffer());
      bytes.set(data,offset);offset+=data.length;
      statusLine.textContent='Загрузка архива · '+Math.round(100*offset/info.size)+'%';
    }
    if(offset!==info.size)throw Error();
    const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
    if(Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('')!==info.sha256)throw Error();
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));
    save(url,info.name);
    setTimeout(()=>URL.revokeObjectURL(url),120000);
    statusLine.textContent='Архив проверен и передан браузеру для сохранения.';
  }catch{statusLine.textContent='Не удалось получить архив. Проверьте соединение и нажмите «Скачать» ещё раз.';}
  finally{button.disabled=false;}
});
