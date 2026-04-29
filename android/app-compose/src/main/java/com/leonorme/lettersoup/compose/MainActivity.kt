package com.leonorme.lettersoup.compose

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.leonorme.lettersoup.compose.ui.theme.LetterSoupTheme
import com.leonorme.lettersoup.compose.viewmodel.GameViewModel
import com.leonorme.lettersoup.core.model.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LetterSoupTheme {
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
        composable("home") { 
            HomeScreen(
                onPlayRandom = { navController.navigate("game/random") },
                onCreateCustom = { navController.navigate("create") }
            ) 
        }
        composable("create") {
            CreateSoupScreen(onBack = { navController.popBackStack() })
        }
        composable("game/{mode}") { backStackEntry ->
            val mode = backStackEntry.arguments?.getString("mode") ?: "random"
            GameScreen(mode = mode, onBack = { navController.popBackStack() })
        }
    }
}

@Composable
fun GlassPanel(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = modifier
            .shadow(1.dp, RoundedCornerShape(24.dp))
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column {
            content()
        }
    }
}

@Composable
fun HomeScreen(onPlayRandom: () -> Unit, onCreateCustom: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize()) {
        // Abstract Background Gradients
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                brush = Brush.radialGradient(listOf(Color(0xFFE0C3FC), Color.Transparent)),
                radius = 600f,
                center = androidx.compose.ui.geometry.Offset(0f, 0f)
            )
            drawCircle(
                brush = Brush.radialGradient(listOf(Color(0xFF8EC5FC), Color.Transparent)),
                radius = 800f,
                center = androidx.compose.ui.geometry.Offset(size.width, size.height)
            )
        }

        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("🍲", fontSize = 64.sp)
            Text(
                "Letter Soup",
                fontSize = 40.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF1A1A1A)
            )
            Text(
                "The delicious word game",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 8.dp)
            )
            
            Spacer(modifier = Modifier.height(64.dp))

            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = onPlayRandom,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6200EE))
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("Random Challenge", fontWeight = FontWeight.Bold)
                }
                
                Spacer(modifier = Modifier.height(16.dp))

                OutlinedButton(
                    onClick = onCreateCustom,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(2.dp, Color(0xFF6200EE))
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, color = Color(0xFF6200EE))
                    Spacer(Modifier.width(8.dp))
                    Text("Create Custom Soup", color = Color(0xFF6200EE), fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateSoupScreen(onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var words by remember { mutableStateOf(listOf("", "", "")) }
    var gridSize by remember { mutableStateOf(6) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Soup", fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Title", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    placeholder = { Text("Secret Message") },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent
                    )
                )
            }

            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Grid Size: $gridSize x $gridSize", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(
                        onClick = { if (gridSize > 5) gridSize-- },
                        modifier = Modifier.background(Color(0xFFF0F0F0), RoundedCornerShape(12.dp))
                    ) {
                        Icon(Icons.Default.KeyboardArrowLeft, contentDescription = null)
                    }
                    
                    Text("$gridSize", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)

                    IconButton(
                        onClick = { if (gridSize < 20) gridSize++ },
                        modifier = Modifier.background(Color(0xFFF0F0F0), RoundedCornerShape(12.dp))
                    ) {
                        Icon(Icons.Default.KeyboardArrowRight, contentDescription = null)
                    }
                }
            }

            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Words", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))
                words.forEachIndexed { index, word ->
                    TextField(
                        value = word,
                        onValueChange = { new -> 
                            val list = words.toMutableList()
                            list[index] = new.uppercase().replace(Regex("[^A-Z]"), "")
                            words = list
                        },
                        placeholder = { Text("Word ${index + 1}") },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters)
                    )
                }
                
                TextButton(
                    onClick = { words = words + "" },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Text("Add Word")
                }
            }

            Button(
                onClick = { /* Navigate to Game with custom data */ },
                modifier = Modifier.fillMaxWidth().height(64.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Generate Soup", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameScreen(mode: String, onBack: () -> Unit, viewModel: GameViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.startRandomGame()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Soup Time!", fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        uiState?.let { state ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp)
            ) {
                GlassPanel(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        state.puzzle.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF6200EE)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    PuzzleGrid(state, onCellClick = { viewModel.onCellClick(it) })
                }

                Spacer(modifier = Modifier.height(16.dp))

                GlassPanel(modifier = Modifier.fillMaxWidth()) {
                    WordList(state)
                }

                AnimatedVisibility(
                    visible = state.status == GameStatus.WON,
                    enter = fadeIn() + expandVertically()
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50)),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp).fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("Victory!", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
                            Text("You found all the ingredients!", color = Color.White.copy(alpha = 0.9f))
                        }
                    }
                }
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
        itemsIndexed(flatCells) { _, cell ->
            val isSelected = state.selectedCells.contains(cell)
            val foundWord = puzzle.words.find { wp -> wp.found && wp.cells.contains(cell) }
            
            val backgroundColor by animateColorAsState(
                when {
                    foundWord != null -> Color(android.graphics.Color.parseColor(foundWord.color))
                    isSelected -> Color(0xFF6200EE).copy(alpha = 0.3f)
                    else -> Color(0xFFF8F9FA)
                },
                animationSpec = tween(300)
            )

            val scale by animateFloatAsState(if (isSelected) 0.95f else 1f)

            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(backgroundColor)
                    .clickable { onCellClick(cell) }
                    .padding(4.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = cell.letter.toString(),
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = if (puzzle.size > 12) 12.sp else 16.sp,
                    color = if (foundWord != null) Color.White else Color.Black
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun WordList(state: GameState) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        state.puzzle.words.forEach { wp ->
            SuggestionChip(
                onClick = { },
                label = { Text(wp.word) },
                enabled = !wp.found,
                colors = SuggestionChipDefaults.suggestionChipColors(
                    disabledLabelColor = Color.Gray,
                    disabledContainerColor = Color(0xFFF0F0F0)
                )
            )
        }
    }
}
