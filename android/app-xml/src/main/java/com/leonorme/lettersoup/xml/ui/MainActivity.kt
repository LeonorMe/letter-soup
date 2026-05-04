package com.leonorme.lettersoup.xml.ui

import android.content.Intent
import android.os.Bundle
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.leonorme.lettersoup.core.engine.GameEngine
import com.leonorme.lettersoup.core.repository.PuzzleRepository
import com.leonorme.lettersoup.xml.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var repository: PuzzleRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        repository = PuzzleRepository(GameEngine())

        binding.btnRandom.setOnClickListener {
            val intent = Intent(this, GameActivity::class.java)
            intent.putExtra("MODE", "RANDOM")
            startActivity(intent)
        }

        binding.btnCreate.setOnClickListener {
            startActivity(Intent(this, CreateActivity::class.java))
        }

        binding.btnShared.setOnClickListener {
            showPasteLinkDialog()
        }

        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data = intent?.data ?: return
        val pathSegments = data.pathSegments
        if (pathSegments.size >= 2 && pathSegments[0] == "share") {
            val encoded = pathSegments[1]
            startGameFromLink(encoded)
        }
    }

    private fun showPasteLinkDialog() {
        val editText = EditText(this)
        editText.hint = "Paste Base64 or Link here"

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 40, 50, 10)
            addView(editText)
        }

        AlertDialog.Builder(this)
            .setTitle("Shared Puzzle")
            .setView(layout)
            .setPositiveButton("Play") { _, _ ->
                val input = editText.text.toString().trim()
                // extract base64 if it's a full link
                val encoded = if (input.contains("/share/")) {
                    input.substringAfter("/share/").substringBefore("/")
                } else {
                    input
                }
                startGameFromLink(encoded)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun startGameFromLink(encoded: String) {
        val words = repository.decodePuzzle(encoded)
        if (words != null && words.isNotEmpty()) {
            val intent = Intent(this, GameActivity::class.java).apply {
                putExtra("MODE", "SHARED")
                putStringArrayListExtra("WORDS", ArrayList(words))
            }
            startActivity(intent)
        } else {
            Toast.makeText(this, "Invalid Shared Link", Toast.LENGTH_SHORT).show()
        }
    }
}
