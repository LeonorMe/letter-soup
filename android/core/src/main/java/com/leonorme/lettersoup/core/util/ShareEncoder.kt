package com.leonorme.lettersoup.core.util

import android.util.Base64

object ShareEncoder {
    
    fun encodeWords(words: List<String>): String {
        val joined = words.joinToString(",")
        return Base64.encodeToString(joined.toByteArray(Charsets.UTF_8), Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    }

    fun decodeWords(encoded: String): List<String>? {
        return try {
            val decodedBytes = Base64.decode(encoded, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
            val decodedString = String(decodedBytes, Charsets.UTF_8)
            decodedString.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        } catch (e: Exception) {
            null
        }
    }
}
