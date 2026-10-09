plugins {
    id("com.android.application")
}

android {
    namespace = "com.elesso.cryptoainews"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.elesso.cryptoainews"
        minSdk = 23
        targetSdk = 34
        versionCode = 3
        versionName = "1.2"
    }

    signingConfigs {
        create("release") {
            storeFile = file("${rootDir}/release.keystore")
            storePassword = project.findProperty("STORE_PASSWORD")?.toString()
            keyAlias = project.findProperty("KEY_ALIAS")?.toString() ?: "cryptoai"
            keyPassword = project.findProperty("KEY_PASSWORD")?.toString()
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
