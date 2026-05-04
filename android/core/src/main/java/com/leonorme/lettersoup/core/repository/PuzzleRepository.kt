package com.leonorme.lettersoup.core.repository

import com.leonorme.lettersoup.core.engine.GameEngine
import com.leonorme.lettersoup.core.model.Puzzle
import com.leonorme.lettersoup.core.util.ShareEncoder

class PuzzleRepository(private val engine: GameEngine) {
    
    private val vocabularies = mapOf(
        "en" to listOf("SOLAR", "FOREST", "OCEAN", "CORAL", "RECYCLE", "COMPOST", "HABITAT", "SPECIES", "GLACIER", "WETLAND"),
        "pt" to listOf("SOLAR", "FLORESTA", "OCEANO", "CORAL", "RECICLAR", "COMPOSTO", "HABITAT", "ESPECIE", "GLACIAR", "PANTANO")
    )

    fun createPuzzle(words: List<String>, size: Int? = null): Puzzle {
        return engine.generateSoup(words, size)
    }

    fun loadRandomVocabularyPuzzle(language: String = "en"): Puzzle {
        val words = vocabularies[language] ?: vocabularies["en"]!!
        val selected = words.shuffled().take(6)
        return engine.generateSoup(selected)
    }

    fun encodePuzzleToShareLink(words: List<String>): String {
        return ShareEncoder.encodeWords(words)
    }

    fun decodePuzzle(link: String): List<String>? {
        return ShareEncoder.decodeWords(link)
    }
}
