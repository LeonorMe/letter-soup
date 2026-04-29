package com.leonorme.lettersoup.xml.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.leonorme.lettersoup.xml.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnRandom.setOnClickListener {
            val intent = Intent(this, GameActivity::class.java)
            intent.putExtra("MODE", "RANDOM")
            startActivity(intent)
        }

        binding.btnCreate.setOnClickListener {
            // TODO: Custom words screen
        }
    }
}
