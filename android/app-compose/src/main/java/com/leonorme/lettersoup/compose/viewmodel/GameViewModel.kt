package com.leonorme.lettersoup.compose.viewmodel

import androidx.lifecycle.ViewModel
import com.leonorme.lettersoup.core.engine.GameEngine
import com.leonorme.lettersoup.core.model.*
import com.leonorme.lettersoup.core.repository.PuzzleRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class GameViewModel : ViewModel() {
    private val engine = GameEngine()
    private val repository = PuzzleRepository(engine)

    private val _uiState = MutableStateFlow<GameState?>(null)
    val uiState: StateFlow<GameState?> = _uiState.asStateFlow()
    
    private val _previewState = MutableStateFlow<Puzzle?>(null)
    val previewState: StateFlow<Puzzle?> = _previewState.asStateFlow()

    fun startRandomGame() {
        val puzzle = repository.loadRandomVocabularyPuzzle()
        _uiState.value = GameState(puzzle)
    }
    
    fun startCustomGame(puzzle: Puzzle) {
        _uiState.value = GameState(puzzle)
    }

    fun generatePreview(title: String, words: List<String>, size: Int) {
        val cleanWords = words.filter { it.length > 1 }
        if (cleanWords.isEmpty()) return
        
        val puzzle = engine.generateSoup(cleanWords, size)
        _previewState.value = puzzle.copy(title = title.ifBlank { "Secret Message" })
    }

    fun onCellClick(cell: Cell) {
        val currentState = _uiState.value ?: return
        val currentSelection = currentState.selectedCells.toMutableList()

        if (currentSelection.contains(cell)) {
            currentSelection.remove(cell)
        } else {
            currentSelection.add(cell)
            val foundWord = engine.validateSelection(currentSelection, currentState.puzzle)
            if (foundWord != null) {
                foundWord.found = true
                _uiState.update { state ->
                    state?.copy(
                        selectedCells = emptyList(),
                        foundWords = state.foundWords + foundWord.word,
                        status = if (state.puzzle.words.all { it.found }) GameStatus.WON else GameStatus.PLAYING
                    )
                }
                return
            }
        }

        _uiState.update { it?.copy(selectedCells = currentSelection) }
    }
}
