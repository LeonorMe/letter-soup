package com.leonorme.lettersoup.xml.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.leonorme.lettersoup.xml.databinding.ActivityCreateBinding

class CreateActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCreateBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnStartCustom.setOnClickListener {
            val wordsStr = binding.etWords.text.toString()
            val words = wordsStr.split(",")
                .map { it.trim().uppercase().replace(Regex("[^A-Z]"), "") }
                .filter { it.length > 1 }

            if (words.isEmpty()) {
                Toast.makeText(this, "Please enter at least one valid word", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val intent = Intent(this, GameActivity::class.java).apply {
                putExtra("MODE", "CUSTOM")
                putStringArrayListExtra("WORDS", ArrayList(words))
            }
            startActivity(intent)
            finish()
        }
    }
}
