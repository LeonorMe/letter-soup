package com.leonorme.lettersoup.core.model

data class Cell(
    val row: Int,
    val col: Int,
    val letter: Char
)

data class WordPlacement(
    val word: String,
    val cells: List<Cell>,
    val color: String,
    var found: Boolean = false
)

data class Puzzle(
    val title: String,
    val creator: String,
    val language: String,
    val size: Int,
    val grid: List<List<Char>>,
    val words: List<WordPlacement>
)

enum class GameStatus {
    PLAYING, WON
}

data class GameState(
    val puzzle: Puzzle,
    val selectedCells: List<Cell> = emptyList(),
    val foundWords: List<String> = emptyList(),
    val status: GameStatus = GameStatus.PLAYING
)
