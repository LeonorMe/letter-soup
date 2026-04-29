rootProject.name = "LetterSoup"
include(":core")
include(":app-xml")
include(":app-compose")

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
