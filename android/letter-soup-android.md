

````md
# Letter Soup Android 🍲

## Overview

Android native version of the existing React PWA "Letter Soup".

The project follows a modular architecture with three modules:

- :core → shared logic and data
- :app-xml → classic Android Views/XML UI
- :app-compose → Jetpack Compose UI

Both apps consume the same gameplay engine.

---

# Module Structure

```text
root
 ├── core
 ├── app-xml
 └── app-compose
````

---

# Dependencies

* app-xml depends on :core
* app-compose depends on :core

No UI logic inside :core.

---

# CORE MODULE

## Responsibilities

Contains all reusable logic:

### Data Models

* Puzzle
* WordPlacement
* Cell
* GameState

### Repository

PuzzleRepository

Functions:

* createPuzzle(words: List<String>, size: Int): Puzzle
* loadRandomVocabularyPuzzle(): Puzzle
* encodePuzzleToShareLink(puzzle)
* decodePuzzle(link)

### Business Logic

GameEngine

Functions:

* selectCell(row,col)
* validateSelection()
* markFoundWord()
* checkWin()

### Utilities

* Random word generator
* Grid filler
* Share encoder/decoder

---

# APP XML MODULE

## Tech

* Activities / Fragments
* RecyclerView/GridLayout
* ViewBinding
* XML Layouts

## Screens

### MainActivity

Menu:

* Create Puzzle
* Random Puzzle
* Shared Puzzle

### GameActivity

Displays grid using RecyclerView.

### Result Screen

Victory message.

---

# APP COMPOSE MODULE

## Tech

* Jetpack Compose
* Navigation Compose
* Material 3

## Screens

### HomeScreen

### CreatePuzzleScreen

### GameScreen

### VictoryScreen

Uses ViewModel + StateFlow.

---

# Compose Exclusive Feature

## Adaptive Grid + Animations

Only Compose version includes:

* AnimatedVisibility when word found
* Animated cell colors
* Responsive LazyVerticalGrid
* Dynamic dark/light theme

This feature does not exist in XML app.

---

# UI Contract

Both UI modules only access:

* PuzzleRepository
* GameEngine

UI never manipulates puzzle logic directly.

Flow:

UI Event → ViewModel/Controller → Core Module → Updated State → Render UI

---

# Refactoring Plan

Original React app logic:

* Grid generation
* Word validation
* Puzzle state
* Share links

Will be rewritten in Kotlin and moved into :core.

Then:

* XML app consumes :core using Activities.
* Compose app consumes :core using ViewModels.

---

# Screens Required

## XML

* Main
* Game
* Results

## Compose

* Home
* Create
* Game
* Results

---

# Suggested Kotlin Packages

core/

* model/
* repository/
* engine/
* utils/

app-xml/

* ui/
* adapters/

app-compose/

* ui/screens/
* ui/components/
* viewmodel/

---

# Deliverables

* Working XML app
* Working Compose app
* Shared core module
* Markdown documentation
* Module dependency diagram

````

---

# Why This Works Well

Your React project maps naturally:

| React App Feature | Android Core |
|---|---|
| Grid generation | GameEngine |
| URL sharing | ShareEncoder |
| State handling | Repository |
| Puzzle play UI | XML + Compose |

---

# Important Tip

Do **not** say “I converted React code to Android.”

Say:

> The previous React prototype was used as a behavioral reference. All Android code was redesigned natively in Kotlin using modular architecture.

That sounds academically correct.

---

# Best Compose Exclusive Feature (easy to implement)

Use:

```text
AnimatedVisibility + Dark Mode Toggle
````




