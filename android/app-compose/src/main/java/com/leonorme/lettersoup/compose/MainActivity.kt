package com.leonorme.lettersoup.compose

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.leonorme.lettersoup.compose.viewmodel.GameViewModel
import com.leonorme.lettersoup.core.model.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") { HomeScreen(onPlay = { navController.navigate("game") }) }
        composable("game") { GameScreen() }
    }
}

@Composable
fun HomeScreen(onPlay: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🍲 Letter Soup", fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(48.dp))
        Button(onClick = onPlay, modifier = Modifier.fillMaxWidth().height(60.dp)) {
            Text("Random Puzzle")
        }
    }
}

@Composable
fun GameScreen(viewModel: GameViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.startRandomGame()
    }

    uiState?.let { state ->
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text(state.puzzle.title, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))

            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                PuzzleGrid(state, onCellClick = { viewModel.onCellClick(it) })
            }

            Spacer(modifier = Modifier.height(16.dp))
            WordList(state)

            if (state.status == GameStatus.WON) {
                Text(
                    "CONGRATULATIONS!",
                    modifier = Modifier.padding(16.dp).align(Alignment.CenterHorizontally),
                    color = Color.Green,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp
                )
            }
        }
    }
}

@Composable
fun PuzzleGrid(state: GameState, onCellClick: (Cell) -> Unit) {
    val puzzle = state.puzzle
    val flatCells = puzzle.grid.flatMapIndexed { r, row ->
        row.mapIndexed { c, char -> Cell(r, c, char) }
    }

    LazyVerticalGrid(
        columns = GridCells.Fixed(puzzle.size),
        contentPadding = PaddingValues(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        itemsIndexed(flatCells) { index, cell ->
            val isSelected = state.selectedCells.contains(cell)
            val foundWord = puzzle.words.find { wp -> wp.found && wp.cells.contains(cell) }
            val backgroundColor by animateColorAsState(
                when {
                    foundWord != null -> Color(android.graphics.Color.parseColor(foundWord.color))
                    isSelected -> Color.LightGray
                    else -> Color(0xFFF0F0F0)
                }
            )

            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .background(backgroundColor, RoundedCornerShape(4.dp))
                    .border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(4.dp))
                    .clickable { onCellClick(cell) },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = cell.letter.toString(),
                    fontWeight = FontWeight.Bold,
                    color = if (foundWord != null) Color.White else Color.Black
                )
            }
        }
    }
}

@Composable
fun WordList(state: GameState) {
    FlowRow(modifier = Modifier.fillMaxWidth()) {
        state.puzzle.words.forEach { wp ->
            Text(
                text = wp.word,
                modifier = Modifier.padding(4.dp),
                color = if (wp.found) Color.Gray else Color.Black,
                fontWeight = if (wp.found) FontWeight.Normal else FontWeight.Bold,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FlowRow(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    androidx.compose.foundation.layout.FlowRow(modifier = modifier) {
        content()
    }
}
