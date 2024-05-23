package io.metamask.reactnativesdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments

import io.metamask.androidsdk.DappMetadata

import io.metamask.androidsdk.Ethereum
import io.metamask.androidsdk.EthereumFlow
import io.metamask.androidsdk.EthereumRequest
import io.metamask.androidsdk.Result
import io.metamask.androidsdk.SDKOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MetaMaskReactNativeSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext
    private var ethereum: EthereumFlow? = null
    private val scope = CoroutineScope(Dispatchers.Main)
    override fun getName(): String {
        return "MetaMaskReactNativeSdk"
    }

    @ReactMethod
    fun initialize(options: ReadableMap) {
        val dappName = options.getString("dappName") ?: ""
        val dappURL = options.getString("dappUrl") ?: ""
        val dappIconUrl = options.getString("dappIconUrl") ?: ""
        val infuraAPIKey = options.getString("infuraAPIKey")

        val dappMetadata = DappMetadata(name = dappName, url = dappURL, iconUrl = dappIconUrl)
        var sdkOptions: SDKOptions? = null

        infuraAPIKey?.let { key ->
            sdkOptions = SDKOptions(key)
        }

        val eth = Ethereum(context, dappMetadata, sdkOptions)
        ethereum = EthereumFlow(eth)
    }

    @ReactMethod
    fun connect(promise: Promise) {
        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.connect()
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun clearSession(promise: Promise) {
        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.clearSession()
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun connectAndSign(message: String, promise: Promise) {
        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.connectSign(message)
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun connectWith(map: ReadableMap, promise: Promise) {
        val req = ethereumRequest(map)

        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.connectWith(req)
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun request(map: ReadableMap, promise: Promise) {
        val req = ethereumRequest(map)

        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.sendRequest(req)
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun batchRequest(reqArray: ReadableArray, promise: Promise) {
        val ethereumRequests = mutableListOf<EthereumRequest>()

        for (i in 0 until reqArray.size()) {
            val req = reqArray.getMap(i)

            val method = req.getString("method") ?: throw IllegalArgumentException("Method is required")
            val params: Any? = req.getDynamic("params").asAny()

            ethereumRequests.add(EthereumRequest(method=method, params=params))
        }

        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.sendRequestBatch(ethereumRequests)
                    }
                    handleResult(result, promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    @ReactMethod
    fun chainId(promise: Promise) {
        ethereum?.let { eth ->
            promise.resolve(eth.chainId)
        }
    }

    @ReactMethod
    fun selectedAddress(promise: Promise) {
        ethereum?.let { eth ->
            promise.resolve(eth.selectedAddress)
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        ethereum?.let { eth ->
            scope.launch {
                try {
                    val result = withContext(Dispatchers.IO) {
                        eth.disconnect(true)
                    }
                    handleResult(Result.Success.Item(""), promise)
                } catch (e: Exception) {
                    promise.reject(e.toString(), e)
                }
            }
        }
    }

    private fun ethereumRequest(request: ReadableMap): EthereumRequest {
        val id = request.getString("id") ?: ""
        val method = request.getString("method") ?: ""
        val params: Any? = request.getDynamic("params").asAny()
        return EthereumRequest(method = method, params = params)
    }

    private fun Dynamic.asAny(): Any? {
        return when (this.type) {
            ReadableType.Null -> null
            ReadableType.Boolean -> this.asBoolean()
            ReadableType.Number -> this.asDouble()
            ReadableType.String -> this.asString()
            ReadableType.Map -> this.asMap().toHashMap()
            ReadableType.Array -> this.asArray().toArrayList()
            else -> throw IllegalArgumentException("Unsupported type")
        }
    }
    private fun handleResult(result: Result, promise: Promise) {
        when (result) {
            is Result.Success.Item -> {
                promise.resolve(result.value)
            }
            is Result.Success.Items -> {
                val list = result.value
                val writableArray: WritableArray = Arguments.createArray()
                for (item in list) {
                    writableArray.pushString(item)
                }
                promise.resolve(writableArray)
            }
            is Result.Success.ItemMap -> {
                promise.resolve(result.value)
            }
            is Result.Error -> {
                promise.reject(result.error.message, result.error.message)
            }
        }
    }
}
