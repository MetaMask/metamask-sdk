package ecies

import "C"

import (
	ecies "github.com/ecies/go/v2"
	b64 "encoding/base64"
)

func FromCString(data *C.char) string{
	return C.GoString(data)
}

func ToCString(data string) *C.char{
	return C.CString(data)
}

//export GeneratePrivateKey
func GeneratePrivateKey() *C.char{
	key, _ := ecies.GenerateKey()

	return ToCString(key.Hex())
}

//export GetPublicKey
func GetPublicKey(privkey *C.char) *C.char{
	privateKey, _ := ecies.NewPrivateKeyFromHex(FromCString(privkey))
	publickey := privateKey.PublicKey.Hex(true)

	return ToCString(publickey)
}

//export Encrypt
func Encrypt(pubkey *C.char, message *C.char) *C.char{
	publicKey, _ := ecies.NewPublicKeyFromHex(FromCString(pubkey))

	encryptedMessage, _ := ecies.Encrypt(publicKey, []byte(FromCString(message)))

	return ToCString(b64.StdEncoding.EncodeToString([]byte(encryptedMessage)))
}

//export Decrypt
func Decrypt(privkey *C.char, messageB64 *C.char) *C.char{
	privateKey, _ := ecies.NewPrivateKeyFromHex(FromCString(privkey))

	decryptedMessageB64, _ := b64.StdEncoding.DecodeString(FromCString(messageB64))
	decryptedMessage, _ := ecies.Decrypt(privateKey, []byte(decryptedMessageB64))

	return ToCString(string([]byte(decryptedMessage)))
}
