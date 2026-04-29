package com.leonorme.lettersoup.compose.util

import android.content.Context
import com.leonorme.lettersoup.core.model.Puzzle
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class PreferenceManager(context: Context) {
    private val prefs = context.getSharedPreferences("letter_soup_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    var username: String?
        get() = prefs.getString("username", null)
        set(value) = prefs.edit().putString("username", value).apply()

    var language: String
        get() = prefs.getString("language", "en") ?: "en"
        set(value) = prefs.edit().putString("language", value).apply()

    var isDarkMode: Boolean
        get() = prefs.getBoolean("dark_mode", false)
        set(value) = prefs.edit().putBoolean("dark_mode", value).apply()

    var wordsFound: Int
        get() = prefs.getInt("words_found", 0)
        set(value) = prefs.edit().putInt("words_found", value).apply()

    var puzzlesWon: Int
        get() = prefs.getInt("puzzles_won", 0)
        set(value) = prefs.edit().putInt("puzzles_won", value).apply()

    fun getSavedSoups(): List<Puzzle> {
        val json = prefs.getString("saved_soups", null) ?: return emptyList()
        val type = object : TypeToken<List<Puzzle>>() {}.type
        return gson.fromJson(json, type)
    }

    fun saveSoup(puzzle: Puzzle) {
        val current = getSavedSoups().toMutableList()
        current.add(0, puzzle)
        prefs.edit().putString("saved_soups", gson.toJson(current)).apply()
    }

    fun deleteSoup(index: Int) {
        val current = getSavedSoups().toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            prefs.edit().putString("saved_soups", gson.toJson(current)).apply()
        }
    }

    fun logout() {
        prefs.edit().remove("username").apply()
    }
}
