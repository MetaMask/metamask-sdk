package main

import "C"

import (	
	ecies "github.com/ecies/go/v2"
	b64 "encoding/base64"
)

func GetString(data *C.char) string{
	return C.GoString(data)
}

//export GeneratePrivateKey
func GeneratePrivateKey() *C.char{
	key, _ := ecies.GenerateKey()

	privkey := key.Bytes()
	return C.CString(b64.StdEncoding.EncodeToString([]byte(privkey)))
}

//export GetPublicKey
func GetPublicKey(privkeyB64 *C.char) *C.char{
	privkeyHex, _ := b64.StdEncoding.DecodeString(GetString(privkeyB64))
	privkey := ecies.NewPrivateKeyFromBytes(privkeyHex)

	publickey := privkey.PublicKey.Bytes(false)
	return C.CString(b64.StdEncoding.EncodeToString([]byte(publickey)))
}

//export Encrypt
func Encrypt(pubkeyB64 *C.char, msg *C.char) *C.char{
	pubkeyHex, _ := b64.StdEncoding.DecodeString(GetString(pubkeyB64))
	pubkey, _ := ecies.NewPublicKeyFromBytes(pubkeyHex)

	encryptedMessage, _ := ecies.Encrypt(pubkey, []byte(GetString(msg)))

	return C.CString(b64.StdEncoding.EncodeToString([]byte(encryptedMessage)))
}

//export Decrypt
func Decrypt(privkeyB64 *C.char, msgB64 *C.char) *C.char{
	privkeyHex, _ := b64.StdEncoding.DecodeString(GetString(privkeyB64))
	privkey := ecies.NewPrivateKeyFromBytes(privkeyHex)

	msg, _ := b64.StdEncoding.DecodeString(GetString(msgB64))
	decryptedMessage, _ := ecies.Decrypt(privkey, msg)

	return C.CString(string(decryptedMessage))
}

func main() {}