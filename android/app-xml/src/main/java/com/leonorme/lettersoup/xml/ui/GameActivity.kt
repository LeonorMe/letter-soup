package com.leonorme.lettersoup.xml.ui

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.leonorme.lettersoup.core.engine.GameEngine
import com.leonorme.lettersoup.core.model.Cell
import com.leonorme.lettersoup.core.model.Puzzle
import com.leonorme.lettersoup.core.repository.PuzzleRepository
import com.leonorme.lettersoup.xml.databinding.ActivityGameBinding

class GameActivity : AppCompatActivity() {
    private lateinit var binding: ActivityGameBinding
    private lateinit var repository: PuzzleRepository
    private lateinit var engine: GameEngine
    private lateinit var puzzle: Puzzle
    private val selectedCells = mutableListOf<Cell>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGameBinding.inflate(layoutInflater)
        setContentView(binding.root)

        engine = GameEngine()
        repository = PuzzleRepository(engine)

        val mode = intent.getStringExtra("MODE") ?: "RANDOM"
        puzzle = if (mode == "RANDOM") {
            repository.loadRandomVocabularyPuzzle()
        } else {
            repository.createPuzzle(listOf("ANDROID", "KOTLIN", "XML", "COMPOSE"))
        }

        setupGrid()
    }

    private fun setupGrid() {
        binding.tvTitle.text = puzzle.title
        val flatCells = puzzle.grid.flatMapIndexed { r, row ->
            row.mapIndexed { c, char -> Cell(r, c, char) }
        }

        val adapter = GridAdapter(puzzle.size, flatCells) { cell ->
            handleCellClick(cell)
        }

        binding.rvGrid.layoutManager = GridLayoutManager(this, puzzle.size)
        binding.rvGrid.adapter = adapter
    }

    private fun handleCellClick(cell: Cell) {
        val adapter = binding.rvGrid.adapter as GridAdapter
        if (selectedCells.contains(cell)) {
            selectedCells.remove(cell)
            adapter.toggleSelection(cell)
        } else {
            selectedCells.add(cell)
            adapter.toggleSelection(cell)
            
            val foundWord = engine.validateSelection(selectedCells, puzzle)
            if (foundWord != null) {
                foundWord.found = true
                adapter.markFound(selectedCells, foundWord.color)
                selectedCells.clear()
                adapter.clearSelection()
                Toast.makeText(this, "Found: ${foundWord.word}", Toast.LENGTH_SHORT).show()
                checkWin()
            }
        }
    }

    private fun checkWin() {
        if (puzzle.words.all { it.found }) {
            Toast.makeText(this, "CONGRATULATIONS!", Toast.LENGTH_LONG).show()
        }
    }
}
