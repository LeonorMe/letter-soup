package com.leonorme.lettersoup.core.engine

import com.leonorme.lettersoup.core.model.*
import java.util.*

class GameEngine {
    private val directions = listOf(
        Pair(0, 1),   // right
        Pair(1, 0),   // down
        Pair(1, 1),   // diagonal right-down
        Pair(-1, 1),  // diagonal right-up
        Pair(0, -1),  // left
        Pair(-1, 0),  // up
        Pair(-1, -1), // diagonal left-up
        Pair(1, -1)   // diagonal left-down
    )

    private val alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    private val rainbowColors = listOf(
        "#FF595E", "#FF924C", "#FFCA3A", "#C5CA30",
        "#8AC926", "#52A675", "#1982C4", "#4267AC",
        "#6A4C93", "#9B5DE5", "#F15BB5", "#FF85A1"
    )

    fun generateSoup(inputWords: List<String>, manualSize: Int? = null): Puzzle {
        val cleanWords = inputWords
            .map { it.uppercase().replace(Regex("[^A-Z]"), "") }
            .filter { it.length > 1 }
            .distinct()
            .take(12)

        if (cleanWords.isEmpty()) {
            return Puzzle("Empty", "System", "en", 6, emptyList(), emptyList())
        }

        val maxLen = cleanWords.maxOf { it.length }
        val areaEstimate = Math.ceil(Math.sqrt(cleanWords.sumOf { it.length }.toDouble())).toInt()
        val minSize = Math.max(5, Math.max(maxLen, areaEstimate))
        val size = if (manualSize != null) Math.max(manualSize, minSize) else Math.max(6, minSize)

        val grid = Array(size) { Array<Char?>(size) { null } }
        val placements = mutableListOf<WordPlacement>()
        val random = Random()

        cleanWords.forEachIndexed { index, word ->
            var placed = false
            var attempts = 0
            while (!placed && attempts < 500) {
                attempts++
                val dir = directions[random.nextInt(directions.size)]
                val startR = random.nextInt(size)
                val startC = random.nextInt(size)

                val cells = mutableListOf<Cell>()
                var canPlace = true

                for (i in word.indices) {
                    val r = startR + dir.first * i
                    val c = startC + dir.second * i

                    if (r !in 0 until size || c !in 0 until size) {
                        canPlace = false
                        break
                    }
                    if (grid[r][c] != null && grid[r][c] != word[i]) {
                        canPlace = false
                        break
                    }
                    cells.add(Cell(r, c, word[i]))
                }

                if (canPlace) {
                    cells.forEach { grid[it.row][it.col] = it.letter }
                    placements.add(WordPlacement(word, cells, rainbowColors[index % rainbowColors.size]))
                    placed = true
                }
            }
        }

        val finalGrid = grid.mapIndexed { _, row ->
            row.mapIndexed { _, char ->
                char ?: alphabet[random.nextInt(alphabet.length)]
            }
        }

        return Puzzle(
            title = "Custom Soup",
            creator = "User",
            language = "en",
            size = size,
            grid = finalGrid,
            words = placements
        )
    }

    fun validateSelection(selectedCells: List<Cell>, puzzle: Puzzle): WordPlacement? {
        if (selectedCells.size < 2) return null
        
        // Selection must be a straight line and match a word
        val words = puzzle.words.filter { !it.found }
        for (wp in words) {
            if (wp.cells.size == selectedCells.size) {
                // Check if all cells match (order might be reversed)
                val matchesForward = wp.cells.indices.all { i -> 
                    wp.cells[i].row == selectedCells[i].row && wp.cells[i].col == selectedCells[i].col 
                }
                val matchesBackward = wp.cells.indices.all { i -> 
                    wp.cells[i].row == selectedCells[selectedCells.size - 1 - i].row && 
                    wp.cells[i].col == selectedCells[selectedCells.size - 1 - i].col 
                }
                
                if (matchesForward || matchesBackward) return wp
            }
        }
        return null
    }
}
