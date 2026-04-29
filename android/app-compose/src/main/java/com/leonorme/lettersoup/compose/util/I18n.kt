package com.leonorme.lettersoup.compose.util

object I18n {
    data class Translations(
        val welcome: (String) -> String,
        val subtitle: String,
        val wordsFound: String,
        val puzzlesWon: String,
        val createSoup: String,
        val learnVocab: String,
        val yourKitchen: String,
        val kitchenEmpty: String,
        val kitchenEmptySub: String,
        val play: String,
        val copied: String,
        val victory: String,
        val victorySub: String,
        val loginTitle: String,
        val loginButton: String,
        val usernameLabel: String
    )

    val languages = mapOf(
        "en" to Translations(
            welcome = { "Welcome, $it! 🍲" },
            subtitle = "What are we cooking today?",
            wordsFound = "Words Found",
            puzzlesWon = "Puzzles Won",
            createSoup = "Create New Soup",
            learnVocab = "Learn Vocabulary 🌍",
            yourKitchen = "Your Kitchen",
            kitchenEmpty = "Your kitchen is empty...",
            kitchenEmptySub = "Create a custom soup to see it here!",
            play = "Play",
            copied = "Copied!",
            victory = "Victory!",
            victorySub = "You found all the ingredients!",
            loginTitle = "Enter the Kitchen",
            loginButton = "Start Cooking",
            usernameLabel = "Chef Name"
        ),
        "pt" to Translations(
            welcome = { "Bem-vindo, $it! 🍲" },
            subtitle = "O que vamos cozinhar hoje?",
            wordsFound = "Palavras Encontradas",
            puzzlesWon = "Sopas Ganhas",
            createSoup = "Criar Nova Sopa",
            learnVocab = "Aprender Vocabulário 🌍",
            yourKitchen = "A Tua Cozinha",
            kitchenEmpty = "A tua cozinha está vazia...",
            kitchenEmptySub = "Cria uma sopa personalizada para a veres aqui!",
            play = "Jogar",
            copied = "Copiado!",
            victory = "Vitória!",
            victorySub = "Encontraste todos os ingredientes!",
            loginTitle = "Entrar na Cozinha",
            loginButton = "Começar a Cozinhar",
            usernameLabel = "Nome do Chef"
        ),
        "es" to Translations(
            welcome = { "¡Bienvenido, $it! 🍲" },
            subtitle = "¿Qué vamos a cocinar hoy?",
            wordsFound = "Palabras Encontradas",
            puzzlesWon = "Sopas Ganadas",
            createSoup = "Crear Nueva Sopa",
            learnVocab = "Aprender Vocabulario 🌍",
            yourKitchen = "Tu Cocina",
            kitchenEmpty = "Tu cocina está vacía...",
            kitchenEmptySub = "¡Crea una sopa personalizada para verla aquí!",
            play = "Jugar",
            copied = "¡Copiado!",
            victory = "¡Victoria!",
            victorySub = "¡Encontraste todos los ingredientes!",
            loginTitle = "Entrar en la Cocina",
            loginButton = "Empezar a Cocinar",
            usernameLabel = "Nombre del Chef"
        )
        // Add more as needed...
    )

    fun get(lang: String) = languages[lang] ?: languages["en"]!!
}
