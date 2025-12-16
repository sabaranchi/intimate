// Lightweight IndexedDB helper for storing avatars (blobs) and image compression
function openDB(){
  return new Promise((res, rej)=>{
    const req = indexedDB.open('intimate-avatars', 1)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if(!db.objectStoreNames.contains('avatars')) db.createObjectStore('avatars')
    }
    req.onsuccess = ()=> res(req.result)
    req.onerror = ()=> rej(req.error)
  })
}

function saveAvatarBlob(blob){
  return openDB().then(db => new Promise((res, rej)=>{
    const id = 'a-' + Date.now() + '-' + Math.floor(Math.random()*10000)
    const tx = db.transaction('avatars', 'readwrite')
    const store = tx.objectStore('avatars')
    const r = store.put(blob, id)
    r.onsuccess = ()=> { res(id); db.close() }
    r.onerror = ()=> { rej(r.error); db.close() }
  }))
}

function getAvatarBlob(id){
  if(!id) return Promise.resolve(null)
  return openDB().then(db => new Promise((res, rej)=>{
    const tx = db.transaction('avatars', 'readonly')
    const store = tx.objectStore('avatars')
    const r = store.get(id)
    r.onsuccess = ()=> { res(r.result || null); db.close() }
    r.onerror = ()=> { rej(r.error); db.close() }
  }))
}

function getAvatarURL(id){
  return getAvatarBlob(id).then(blob => {
    if(!blob) return null
    return URL.createObjectURL(blob)
  })
}

function deleteAvatar(id){
  return openDB().then(db => new Promise((res, rej)=>{
    const tx = db.transaction('avatars', 'readwrite')
    const store = tx.objectStore('avatars')
    const r = store.delete(id)
    r.onsuccess = ()=> { res(true); db.close() }
    r.onerror = ()=> { rej(r.error); db.close() }
  }))
}

// compress image file to a Blob (JPEG) using canvas
function compressImage(file, maxWidth = 512, quality = 0.75){
  return new Promise((res, rej)=>{
    const img = new Image()
    img.onload = ()=>{
      let w = img.width
      let h = img.height
      if(w > maxWidth){
        h = Math.round(h * (maxWidth / w))
        w = maxWidth
      }
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      c.toBlob(b => { if(!b) rej(new Error('toBlob failed')); else res(b) }, 'image/jpeg', quality)
      URL.revokeObjectURL(img.src)
    }
    img.onerror = ()=> rej(new Error('image load error'))
    img.src = URL.createObjectURL(file)
  })
}

async function saveCompressedAvatar(file, opts = {}){
  const maxWidth = opts.maxWidth || 512
  const quality = opts.quality || 0.75
  try{
    const blob = await compressImage(file, maxWidth, quality)
    const id = await saveAvatarBlob(blob)
    return id
  }catch(e){
    // fallback: store original file
    const id = await saveAvatarBlob(file)
    return id
  }
}

export { saveAvatarBlob, saveCompressedAvatar, getAvatarBlob, getAvatarURL, deleteAvatar }
