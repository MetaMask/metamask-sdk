package main

import "C"

import (
	"fmt"
	ecies "github.com/ecies/go/v2"
	b64 "encoding/base64"
)

func GetString(data *C.char) string{
	return C.GoString(data)
}

func ToString(data string) *C.char{
	return C.CString(data)
}

//export GeneratePrivateKey
func GeneratePrivateKey() *C.char{
	key, _ := ecies.GenerateKey()

	privkey := key.Hex()
	return ToString(b64.StdEncoding.EncodeToString([]byte(privkey)))
}

//export GetPublicKey
func GetPublicKey(privkeyB64 *C.char) *C.char{
	privkeyHex, _ := b64.StdEncoding.DecodeString(GetString(privkeyB64))
	privkey, _ := ecies.NewPrivateKeyFromHex(string([]byte(privkeyHex)))
	
	publickey := privkey.PublicKey.Hex(false)
	publickey64 := b64.StdEncoding.EncodeToString([]byte(publickey))

	return ToString(publickey64)
}

//export Encrypt
func Encrypt(pubkeyB64 *C.char, msg *C.char) *C.char{
	pubkeyHex, _ := b64.StdEncoding.DecodeString(GetString(pubkeyB64))
	pubkey, _ := ecies.NewPublicKeyFromHex(string([]byte(pubkeyHex)))

	encryptedMessage, _ := ecies.Encrypt(pubkey, []byte(GetString(msg)))

	return ToString(b64.StdEncoding.EncodeToString([]byte(encryptedMessage)))
}

//export Decrypt
func Decrypt(privkeyB64 *C.char, msgB64 *C.char) *C.char{
	privkeyHex, _ := b64.StdEncoding.DecodeString(GetString(privkeyB64))	
	privkey, _ := ecies.NewPrivateKeyFromHex(string([]byte(privkeyHex)))

	msg, _ := b64.StdEncoding.DecodeString(GetString(msgB64))
	decryptedMessage, _ := ecies.Decrypt(privkey, msg)

	return ToString(string(decryptedMessage))
}

func GoTest(){
	message := "{\"type\":\"originator_info\",\"originatorInfo\":{\"title\":\"myapp\",\"url\":\"myapp.com\"}}"

	private_alice := GeneratePrivateKey()
	public_alice := GetPublicKey(private_alice)
	fmt.Println("ALICE PUBLIC")
	fmt.Println(public_alice)

	private_bob := GeneratePrivateKey()
	public_bob := GetPublicKey(private_bob)
	fmt.Println("BOB PUBLIC")
	fmt.Println(private_bob)

	alice_bob_encrypted := Encrypt(public_bob, ToString(message))
	fmt.Println("> alice_bob_encrypted")
	fmt.Println(GetString(alice_bob_encrypted))
	alice_bob_decryted := Decrypt(private_bob, alice_bob_encrypted)
	fmt.Println("> alice_bob_decryted")
	fmt.Println(GetString(alice_bob_decryted))

	bob_alice_encrypted := Encrypt(public_alice, ToString(message))
	fmt.Println("> bob_alice_encrypted")
	fmt.Println(GetString(bob_alice_encrypted))
	bob_alice_decryted := Decrypt(private_alice, bob_alice_encrypted)
	fmt.Println("> bob_alice_decryted")
	fmt.Println(GetString(bob_alice_decryted))
}

func UnityTest(){
	plainText := "{\"type\":\"originator_info\",\"originatorInfo\":{\"title\":\"myapp\",\"url\":\"myapp.com\"}}"
	publicKey64 := "MDNlYjJmZGM0MGM4M2ZlMTUxZDQ1MWYyN2NiMjUxNGFiMGM1ZGMzMTRmYTE2ZGFiZWE4N2Y0ZmUwM2U3Nzc2MDA2"
	// decodedPublicKey :="03eb2fdc40c83fe151d451f27cb2514ab0c5dc314fa16dabea87f4fe03e7776006"

	encrytedMessage := Encrypt(ToString(string(publicKey64)), ToString(string(plainText)))
	fmt.Println("UNITY TEST")
	fmt.Println(GetString(encrytedMessage))
}


func main() {
	// GoTest()
	// UnityTest()
}