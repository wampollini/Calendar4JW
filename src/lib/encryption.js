// Utility per criptare/decriptare password usando Web Crypto API
// Gratis, già incluso nei browser moderni, sicuro

const ENCRYPTION_KEY_NAME = 'calendar4jw_encryption_key';

// Genera o recupera la chiave di criptazione
async function getEncryptionKey() {
  const stored = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (stored) {
    const keyData = JSON.parse(stored);
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Genera nuova chiave
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Salva la chiave
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));
  
  return key;
}

// Cripta una stringa
export async function encryptPassword(password) {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(password);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedText
    );
    
    // Combina IV + dati criptati e converti in base64
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[Crypto] Errore criptazione:', error);
    throw error;
  }
}

// Decripta una stringa
export async function decryptPassword(encryptedPassword) {
  try {
    console.log('[Crypto] Starting decryption...');
    const key = await getEncryptionKey();
    console.log('[Crypto] Encryption key obtained');
    const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));
    console.log('[Crypto] Encrypted data decoded, length:', combined.length);
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    console.log('[Crypto] Calling crypto.subtle.decrypt...');
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    console.log('[Crypto] Decryption successful');
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('[Crypto] Errore decriptazione:', error);
    throw error;
  }
}
