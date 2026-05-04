package com.leonorme.lettersoup.compose

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
//import androidx.compose.animation.core.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.leonorme.lettersoup.compose.ui.theme.LetterSoupTheme
import com.leonorme.lettersoup.compose.util.I18n
import com.leonorme.lettersoup.compose.util.PreferenceManager
import com.leonorme.lettersoup.compose.viewmodel.GameViewModel
import com.leonorme.lettersoup.core.model.*

import android.widget.Toast
import com.leonorme.lettersoup.core.repository.PuzzleRepository
import com.leonorme.lettersoup.core.engine.GameEngine

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val repository = PuzzleRepository(GameEngine())
        var initialPuzzle: Puzzle? = null

        val data = intent?.data
        if (data != null && data.pathSegments.size >= 2 && data.pathSegments[0] == "share") {
            val encoded = data.pathSegments[1]
            val words = repository.decodePuzzle(encoded)
            if (words != null && words.isNotEmpty()) {
                initialPuzzle = repository.createPuzzle(words)
            } else {
                Toast.makeText(this, "Invalid Shared Link", Toast.LENGTH_SHORT).show()
            }
        }

        setContent {
            val context = LocalContext.current
            val prefs = remember { PreferenceManager(context) }
            
            var currentLanguage by remember { mutableStateOf(prefs.language) }
            var isDarkMode by remember { mutableStateOf(prefs.isDarkMode) }
            var username by remember { mutableStateOf(prefs.username) }

            LetterSoupTheme(darkTheme = isDarkMode) {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    if (username == null) {
                        LoginScreen(onLogin = { 
                            prefs.username = it
                            username = it
                        })
                    } else {
                        AppNavigation(
                            username = username!!,
                            language = currentLanguage,
                            isDarkMode = isDarkMode,
                            onLanguageChange = { 
                                prefs.language = it
                                currentLanguage = it
                            },
                            onThemeToggle = {
                                prefs.isDarkMode = !isDarkMode
                                isDarkMode = !isDarkMode
                            },
                            onLogout = {
                                prefs.logout()
                                username = null
                            },
                            prefs = prefs,
                            initialPuzzle = initialPuzzle
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LoginScreen(onLogin: (String) -> Unit) {
    var name by remember { mutableStateOf("") }
    
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("🍲", fontSize = 80.sp)
            Text("Letter Soup", fontSize = 40.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(modifier = Modifier.height(32.dp))
            
            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Chef Name", fontWeight = FontWeight.Bold)
                TextField(
                    value = name,
                    onValueChange = { name = it },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    placeholder = { Text("Gordon Ramsay") }
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { if (name.isNotBlank()) onLogin(name) },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Start Cooking", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AppNavigation(
    username: String,
    language: String,
    isDarkMode: Boolean,
    onLanguageChange: (String) -> Unit,
    onThemeToggle: () -> Unit,
    onLogout: () -> Unit,
    prefs: PreferenceManager,
    initialPuzzle: Puzzle? = null
) {
    val navController = rememberNavController()
    val gameViewModel: GameViewModel = viewModel()

    LaunchedEffect(initialPuzzle) {
        if (initialPuzzle != null) {
            gameViewModel.startCustomGame(initialPuzzle)
        }
    }

    NavHost(navController = navController, startDestination = if (initialPuzzle != null) "game" else "home") {
        composable("home") { 
            HomeScreen(
                username = username,
                language = language,
                isDarkMode = isDarkMode,
                onLanguageChange = onLanguageChange,
                onThemeToggle = onThemeToggle,
                onLogout = onLogout,
                onPlayRandom = { 
                    gameViewModel.startRandomGame()
                    navController.navigate("game") 
                },
                onCreateCustom = { navController.navigate("create") },
                onPlayPuzzle = { puzzle ->
                    gameViewModel.startCustomGame(puzzle)
                    navController.navigate("game")
                },
                prefs = prefs
            ) 
        }
        composable("create") {
            CreateSoupScreen(
                viewModel = gameViewModel,
                language = language,
                onBack = { navController.popBackStack() },
                onPlay = { puzzle ->
                    gameViewModel.startCustomGame(puzzle)
                    navController.navigate("game")
                },
                onSave = { prefs.saveSoup(it) }
            )
        }
        composable("game") {
            GameScreen(
                viewModel = gameViewModel,
                language = language,
                onBack = { 
                    if (navController.previousBackStackEntry == null) {
                        navController.navigate("home") { popUpTo(0) }
                    } else {
                        navController.popBackStack()
                    }
                },
                onWin = {
                    prefs.puzzlesWon += 1
                }
            )
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
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column {
            content()
        }
    }
}

@Composable
fun HomeScreen(
    username: String,
    language: String,
    isDarkMode: Boolean,
    onLanguageChange: (String) -> Unit,
    onThemeToggle: () -> Unit,
    onLogout: () -> Unit,
    onPlayRandom: () -> Unit,
    onCreateCustom: () -> Unit,
    onPlayPuzzle: (Puzzle) -> Unit,
    prefs: PreferenceManager
) {
    val context = LocalContext.current
    val t = I18n.get(language)
    val savedSoups = remember { prefs.getSavedSoups() }
    var showLangPicker by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
            Column {
                Text(t.welcome(username), fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                Text(t.subtitle, color = Color.Gray)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { showLangPicker = true }) {
                    Icon(Icons.Default.Translate, null)
                }
                IconButton(onClick = onThemeToggle) {
                    Icon(if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode, null)
                }
                IconButton(onClick = onLogout) {
                    Icon(Icons.AutoMirrored.Filled.Logout, null)
                }
            }
        }

        if (showLangPicker) {
            AlertDialog(
                onDismissRequest = { showLangPicker = false },
                title = { Text("Select Language") },
                text = {
                    Column {
                        listOf("en" to "English 🇺🇸", "pt" to "Português 🇵🇹", "es" to "Español 🇪🇸").forEach { (code, label) ->
                            TextButton(
                                onClick = { 
                                    onLanguageChange(code)
                                    showLangPicker = false
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(label, fontWeight = if (language == code) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                },
                confirmButton = { }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        GlassPanel(modifier = Modifier.fillMaxWidth()) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("${prefs.wordsFound}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text(t.wordsFound, fontSize = 12.sp)
                }
                Box(modifier = Modifier.width(1.dp).height(40.dp).background(Color.LightGray))
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("${prefs.puzzlesWon}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEAB308))
                    Text(t.puzzlesWon, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onCreateCustom,
            modifier = Modifier.fillMaxWidth().height(64.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.AddCircle, null)
            Spacer(Modifier.width(8.dp))
            Text(t.createSoup, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = onPlayRandom,
            modifier = Modifier.fillMaxWidth().height(64.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.Casino, null)
            Spacer(Modifier.width(8.dp))
            Text(t.learnVocab, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(t.yourKitchen, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(modifier = Modifier.height(16.dp))

        if (savedSoups.isEmpty()) {
            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text(t.kitchenEmpty, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.CenterHorizontally))
                Text(t.kitchenEmptySub, fontSize = 12.sp, color = Color.Gray, modifier = Modifier.align(Alignment.CenterHorizontally))
            }
        } else {
            savedSoups.forEachIndexed { index, puzzle ->
                GlassPanel(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .clickable { onPlayPuzzle(puzzle) }
                ) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(puzzle.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("${puzzle.words.size} words • ${puzzle.size}x${puzzle.size}", fontSize = 12.sp, color = Color.Gray)
                        }
                        Row {
                            IconButton(onClick = { 
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "Try my Letter Soup puzzle: ${puzzle.title}!")
                                    type = "text/plain"
                                }
                                context.startActivity(Intent.createChooser(sendIntent, null))
                            }) {
                                Icon(Icons.Default.Share, null, tint = Color.Gray)
                            }
                            IconButton(onClick = { prefs.deleteSoup(index) }) {
                                Icon(Icons.Default.Delete, null, tint = Color(0xFFFF595E))
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateSoupScreen(
    viewModel: GameViewModel,
    language: String,
    onBack: () -> Unit,
    onPlay: (Puzzle) -> Unit,
    onSave: (Puzzle) -> Unit
) {
    val context = LocalContext.current
    val t = I18n.get(language)
    var title by remember { mutableStateOf("") }
    var words by remember { mutableStateOf(listOf("", "", "")) }
    var gridSize by remember { mutableIntStateOf(6) }
    var hasManualSize by remember { mutableStateOf(false) }
    var showAnswers by remember { mutableStateOf(false) }
    var isSaved by remember { mutableStateOf(false) }
    
    val previewSoup by viewModel.previewState.collectAsState()

    val cleanWords = words
        .map { it.trim().uppercase().replace(Regex("[^A-Z]"), "") }
        .filter { it.length > 1 }

    val longestLen = if (cleanWords.isEmpty()) 0 else cleanWords.maxOf { it.length }
    val areaEstimate = if (cleanWords.isEmpty()) 0 else Math.ceil(Math.sqrt(cleanWords.sumOf { it.length }.toDouble())).toInt()
    val minRequiredSize = Math.max(5, Math.max(longestLen, areaEstimate))

    LaunchedEffect(cleanWords, longestLen, areaEstimate) {
        if (!hasManualSize) {
            val autoSize = Math.max(6, Math.max(longestLen + 1, areaEstimate))
            gridSize = autoSize
        } else if (gridSize < minRequiredSize) {
            gridSize = minRequiredSize
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(t.createSoup, fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
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
                Text("Title", fontWeight = FontWeight.Bold)
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    placeholder = { Text("Secret Message") },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
            }

            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Grid Size: $gridSize x $gridSize", fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(
                        onClick = { 
                            hasManualSize = true
                            if (gridSize > minRequiredSize) gridSize-- 
                        },
                        modifier = Modifier.background(Color(0xFFF0F0F0), RoundedCornerShape(12.dp)),
                        enabled = gridSize > minRequiredSize
                    ) {
                        Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, null)
                    }
                    Text("$gridSize", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                    IconButton(
                        onClick = { 
                            hasManualSize = true
                            if (gridSize < 30) gridSize++ 
                        },
                        modifier = Modifier.background(Color(0xFFF0F0F0), RoundedCornerShape(12.dp)),
                        enabled = gridSize < 30
                    ) {
                        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null)
                    }
                }
            }

            GlassPanel(modifier = Modifier.fillMaxWidth()) {
                Text("Words (${cleanWords.size})", fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))
                words.forEachIndexed { index, word ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextField(
                            value = word,
                            onValueChange = { new -> 
                                val list = words.toMutableList()
                                list[index] = new.uppercase().replace(Regex("[^A-Z]"), "")
                                words = list
                            },
                            placeholder = { Text("Word ${index + 1}") },
                            modifier = Modifier.weight(1f).padding(bottom = 8.dp)
                        )
                        if (words.size > 1) {
                            IconButton(onClick = { words = words.filterIndexed { i, _ -> i != index } }) {
                                Icon(Icons.Default.Close, null, tint = Color.Gray)
                            }
                        }
                    }
                }
                if (words.size < 12) {
                    TextButton(onClick = { words = words + "" }, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Default.Add, null)
                        Text("Add Word")
                    }
                }
            }

            Button(
                onClick = { viewModel.generatePreview(title, words, gridSize) },
                modifier = Modifier.fillMaxWidth().height(64.dp),
                shape = RoundedCornerShape(16.dp),
                enabled = cleanWords.isNotEmpty()
            ) {
                Text("Generate Preview", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }

            previewSoup?.let { puzzle ->
                GlassPanel(modifier = Modifier.fillMaxWidth().animateContentSize()) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Preview", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                        TextButton(onClick = { showAnswers = !showAnswers }) {
                            Icon(if (showAnswers) Icons.Default.VisibilityOff else Icons.Default.Visibility, null)
                            Spacer(Modifier.width(4.dp))
                            Text(if (showAnswers) "Hide" else "Show")
                        }
                    }

                    Box(modifier = Modifier.fillMaxWidth().aspectRatio(1f).background(Color(0xFFEEEEEE), RoundedCornerShape(12.dp)).padding(4.dp)) {
                        LazyVerticalGrid(columns = GridCells.Fixed(puzzle.size)) {
                            itemsIndexed(puzzle.grid.flatten()) { idx, char ->
                                val rIdx = idx / puzzle.size
                                val cIdx = idx % puzzle.size
                                val foundWord = puzzle.words.find { it.cells.any { cell -> cell.row == rIdx && cell.col == cIdx } }
                                val bgColor = if (showAnswers && foundWord != null) Color(android.graphics.Color.parseColor(foundWord.color)) else Color.White
                                Box(modifier = Modifier.aspectRatio(1f).padding(1.dp).background(bgColor, RoundedCornerShape(2.dp)), contentAlignment = Alignment.Center) {
                                    Text(char.toString(), fontSize = if (puzzle.size > 15) 8.sp else 12.sp, color = if (showAnswers && foundWord != null) Color.White else Color.Black)
                                }
                            }
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth().padding(top = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { onSave(puzzle); isSaved = true }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = if (isSaved) Color.Gray else MaterialTheme.colorScheme.primary)) {
                            Icon(Icons.Default.Save, null)
                            Text(if (isSaved) "Saved" else "Save")
                        }
                        Button(onClick = { 
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, "Try my Letter Soup puzzle: ${puzzle.title}!")
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, null))
                        }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                            Icon(Icons.Default.Share, null)
                            Text("Share")
                        }
                    }

                    Button(onClick = { onPlay(puzzle) }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(56.dp), shape = RoundedCornerShape(12.dp)) {
                        Icon(Icons.Default.PlayArrow, null)
                        Text("Play Now", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameScreen(viewModel: GameViewModel, language: String, onBack: () -> Unit, onWin: () -> Unit) {
    val uiState by viewModel.uiState.collectAsState()
    val t = I18n.get(language)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState?.puzzle?.title ?: "Soup Time!", fontWeight = FontWeight.ExtraBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                }
            )
        }
    ) { padding ->
        uiState?.let { state ->
            Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth().shadow(4.dp, RoundedCornerShape(16.dp)).background(Color.White, RoundedCornerShape(16.dp)).padding(8.dp), contentAlignment = Alignment.Center) {
                    PuzzleGrid(state, onCellClick = { viewModel.onCellClick(it) })
                }
                Spacer(modifier = Modifier.height(16.dp))
                GlassPanel(modifier = Modifier.fillMaxWidth()) {
                    WordList(state)
                }
                AnimatedVisibility(visible = state.status == GameStatus.WON, enter = fadeIn() + expandVertically()) {
                    LaunchedEffect(Unit) { onWin() }
                    Card(modifier = Modifier.fillMaxWidth().padding(top = 16.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50)), shape = RoundedCornerShape(16.dp)) {
                        Column(modifier = Modifier.padding(24.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(t.victory, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 28.sp)
                            Text(t.victorySub, color = Color.White.copy(alpha = 0.9f), fontSize = 16.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(onClick = onBack, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF4CAF50))) {
                                Text("Back to Kitchen", fontWeight = FontWeight.Bold)
                            }
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
                    isSelected -> MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                    else -> MaterialTheme.colorScheme.surfaceVariant
                },
                animationSpec = tween(300),
                label = "cellBg"
            )

            val scale by animateFloatAsState(
                targetValue = if (isSelected) 0.95f else 1f,
                label = "cellScale"
            )

            Box(
                modifier = Modifier
                    .aspectRatio(1f)
                    .scale(scale)
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
                    color = if (foundWord != null) Color.White else MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun WordList(state: GameState) {
    FlowRow(
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
                    disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    }
}
