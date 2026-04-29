package com.leonorme.lettersoup.compose.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)

val RainbowColors = listOf(
    Color(0xFFFF595E),
    Color(0xFFFF924C),
    Color(0xFFFFCA3A),
    Color(0xFFC5CA30),
    Color(0xFF8AC926),
    Color(0xFF52A675),
    Color(0xFF1982C4),
    Color(0xFF4267AC),
    Color(0xFF6A4C93),
    Color(0xFF9B5DE5),
    Color(0xFFF15BB5),
    Color(0xFFFF85A1)
)

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40,
    background = Color(0xFFF8F9FA)
)

@Composable
fun LetterSoupTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
