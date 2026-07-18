import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  FileCode, 
  Smartphone, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Smartphone as DeviceIcon, 
  Database,
  Sliders,
  Mail,
  Phone,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- INITIAL SEED DATA ---
const INITIAL_CLIENTS = [
  { id: 1, name: "Carlos Mendoza", phone: "+56 9 8765 4321" },
  { id: 2, name: "Sofía Valenzuela", phone: "+56 9 1234 5678" },
  { id: 3, name: "Matías Carrasco", phone: "+56 9 5555 4433" },
  { id: 4, name: "Valentina Rojas", phone: "+56 9 9988 7766" }
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 101,
    clientId: 1,
    serviceName: "Netflix",
    email: "carlos.mendoza@gmail.com",
    startDate: getFormattedDateOffset(-25), // Hace 25 días
    endDate: getFormattedDateOffset(5),     // Vence en 5 días (Por Vencer)
    monthsDuration: 1
  },
  {
    id: 102,
    clientId: 2,
    serviceName: "ChatGPT Plus",
    email: "sofia.val@outlook.com",
    startDate: getFormattedDateOffset(-45), // Hace 45 días
    endDate: getFormattedDateOffset(-15),    // Venció hace 15 días (Vencida)
    monthsDuration: 1
  },
  {
    id: 103,
    clientId: 3,
    serviceName: "Spotify Family",
    email: "matias.carrasco@work.com",
    startDate: getFormattedDateOffset(-10), // Hace 10 días
    endDate: getFormattedDateOffset(50),    // Vence en 50 días (Activa)
    monthsDuration: 2
  },
  {
    id: 104,
    clientId: 4,
    serviceName: "Disney+",
    email: "vale.rojas.tv@gmail.com",
    startDate: getFormattedDateOffset(-30), // Hace 30 días
    endDate: getFormattedDateOffset(0),     // Vence HOY (Por vencer / Alerta roja)
    monthsDuration: 1
  }
];

// Helper to calculate date strings easily relative to today
function getFormattedDateOffset(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Android Code Files to Display
const CODE_FILES = {
  "build.gradle.kts": {
    language: "kotlin",
    icon: Sliders,
    path: "android/app/build.gradle.kts",
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt) // Para Room annotation processing
}

android {
    namespace = "com.patindeck.adminservices"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.patindeck.adminservices"
        minSdk = 26 // Para usar java.time nativamente
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose (UI)
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // ViewModel y StateFlow
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
}`
  },
  "AppDatabase.kt": {
    language: "kotlin",
    icon: Database,
    path: "android/app/.../AppDatabase.kt",
    code: `package com.patindeck.adminservices

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// --- ENTIDADES ---

@Entity(tableName = "clients")
data class Client(
    @PrimaryKey(autoGenerate = true) val clientId: Long = 0,
    val name: String,
    val phone: String
)

@Entity(
    tableName = "subscriptions",
    foreignKeys = [
        ForeignKey(
            entity = Client::class,
            parentColumns = ["clientId"],
            childColumns = ["clientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["clientId"])]
)
data class Subscription(
    @PrimaryKey(autoGenerate = true) val subscriptionId: Long = 0,
    val clientId: Long,
    val serviceName: String,     // Ej: "Netflix", "Spotify"
    val email: String,           // Correo entregado
    val startDate: String,       // Formato ISO: "YYYY-MM-DD"
    val endDate: String,         // Formato ISO: "YYYY-MM-DD"
    val monthsDuration: Int      // 1 o 2 meses
)

// --- RELACIÓN CONSOLIDADA ---

data class ClientWithSubscriptions(
    @Embedded val client: Client,
    @Relation(
        parentColumn = "clientId",
        entityColumn = "clientId"
    )
    val subscriptions: List<Subscription>
)

// --- DAO ---

@Dao
interface AppDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClient(client: Client): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubscription(subscription: Subscription): Long

    @Query("SELECT * FROM clients ORDER BY name ASC")
    fun getAllClients(): Flow<List<Client>>

    @Transaction
    @Query("SELECT * FROM clients ORDER BY name ASC")
    fun getAllClientsWithSubscriptions(): Flow<List<ClientWithSubscriptions>>

    @Delete
    suspend fun deleteClient(client: Client)

    @Delete
    suspend fun deleteSubscription(subscription: Subscription)
}

// --- BASE DE DATOS ---

@Database(entities = [Client::class, Subscription::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun appDao(): AppDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "patindeck_admin_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  "AppViewModel.kt": {
    language: "kotlin",
    icon: FileCode,
    path: "android/app/.../AppViewModel.kt",
    code: `package com.patindeck.adminservices

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).appDao()

    val clientsWithSubscriptions: StateFlow<List<ClientWithSubscriptions>> = dao.getAllClientsWithSubscriptions()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    fun insertClient(name: String, phone: String, onSuccess: (Long) -> Unit = {}) {
        viewModelScope.launch {
            if (name.isNotBlank() && phone.isNotBlank()) {
                val client = Client(name = name.trim(), phone = phone.trim())
                val newId = dao.insertClient(client)
                onSuccess(newId)
            }
        }
    }

    fun insertSubscription(
        clientId: Long,
        serviceName: String,
        email: String,
        monthsDuration: Int
    ) {
        viewModelScope.launch {
            if (serviceName.isNotBlank() && email.isNotBlank()) {
                val today = LocalDate.now()
                // Calcular fecha vencimiento sumando 1 o 2 meses
                val expirationDate = today.plusMonths(monthsDuration.toLong())
                
                val subscription = Subscription(
                    clientId = clientId,
                    serviceName = serviceName.trim(),
                    email = email.trim(),
                    startDate = today.format(dateFormatter),
                    endDate = expirationDate.format(dateFormatter),
                    monthsDuration = monthsDuration
                )
                dao.insertSubscription(subscription)
            }
        }
    }

    fun deleteClient(client: Client) {
        viewModelScope.launch { dao.deleteClient(client) }
    }

    fun deleteSubscription(subscription: Subscription) {
        viewModelScope.launch { dao.deleteSubscription(subscription) }
    }

    fun getSubscriptionStatus(endDateStr: String): SubscriptionStatus {
        return try {
            val endDate = LocalDate.parse(endDateStr, dateFormatter)
            val today = LocalDate.now()
            when {
                endDate.isBefore(today) -> SubscriptionStatus.VENCIDA
                endDate.isEqual(today) || (endDate.isAfter(today) && endDate.isBefore(today.plusDays(8))) -> SubscriptionStatus.POR_VENCER
                else -> SubscriptionStatus.ACTIVA
            }
        } catch (e: Exception) {
            SubscriptionStatus.ACTIVA
        }
    }

    fun getDaysRemaining(endDateStr: String): Long {
        return try {
            val endDate = LocalDate.parse(endDateStr, dateFormatter)
            val today = LocalDate.now()
            java.time.temporal.ChronoUnit.DAYS.between(today, endDate)
        } catch (e: Exception) {
            0L
        }
    }
}

enum class SubscriptionStatus {
    ACTIVA,
    POR_VENCER,
    VENCIDA
}`
  },
  "MainActivity.kt": {
    language: "kotlin",
    icon: Smartphone,
    path: "android/app/.../MainActivity.kt",
    code: `package com.patindeck.adminservices

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFFE50914), // Rojo Patin Deck
                    background = Color(0xFF121212),
                    surface = Color(0xFF1D1D1D)
                )
            ) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    DashboardScreen(viewModel)
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(viewModel: AppViewModel) {
    // Interfaz con buscador, estadísticas y lista de clientes
    // ... (Ver código completo en la pestaña correspondiente)
}`
  }
};

export default function App() {
  // --- LOCAL PERSISTENCE ---
  const [clients, setClients] = useState<any[]>(() => {
    const local = localStorage.getItem('patin_deck_clients');
    return local ? JSON.parse(local) : INITIAL_CLIENTS;
  });

  const [subscriptions, setSubscriptions] = useState<any[]>(() => {
    const local = localStorage.getItem('patin_deck_subs');
    return local ? JSON.parse(local) : INITIAL_SUBSCRIPTIONS;
  });

  useEffect(() => {
    localStorage.setItem('patin_deck_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('patin_deck_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // --- COMPONENT STATE ---
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');
  const [activeCodeFile, setActiveCodeFile] = useState<keyof typeof CODE_FILES>("MainActivity.kt");
  const [copied, setCopied] = useState(false);

  // Search and Dialogs State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [selectedClientForSub, setSelectedClientForSub] = useState<any | null>(null);

  // New Client Form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // New Subscription Form
  const [subService, setSubService] = useState('Netflix');
  const [subCustomService, setSubCustomService] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subDuration, setSubDuration] = useState<1 | 2>(1);

  // Expanded client sublist in UI
  const [expandedClients, setExpandedClients] = useState<Record<number, boolean>>({
    1: true,
    2: true
  });

  // Toggle expand/collapse client
  const toggleExpand = (id: number) => {
    setExpandedClients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper helper to copy code
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- SUBSCRIPTION STATUS CALCULATOR ---
  const getSubscriptionStatus = (endDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "VENCIDA", color: "text-red-500 bg-red-950/40 border-red-900/50", badge: "bg-red-500 text-white", days: diffDays };
    } else if (diffDays <= 7) {
      return { status: "POR_VENCER", color: "text-amber-500 bg-amber-950/40 border-amber-900/50", badge: "bg-amber-500 text-black", days: diffDays };
    } else {
      return { status: "ACTIVA", color: "text-emerald-500 bg-emerald-950/40 border-emerald-900/50", badge: "bg-emerald-500 text-white", days: diffDays };
    }
  };

  // --- ACTIONS ---
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const newClient = {
      id: Date.now(),
      name: clientName.trim(),
      phone: clientPhone.trim()
    };

    setClients(prev => [...prev, newClient]);
    setClientName('');
    setClientPhone('');
    setShowAddClient(false);
  };

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForSub) return;
    if (!subEmail.trim()) return;

    const service = subService === 'Otro' ? subCustomService.trim() : subService;
    if (!service) return;

    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + subDuration);

    const newSub = {
      id: Date.now(),
      clientId: selectedClientForSub.id,
      serviceName: service,
      email: subEmail.trim(),
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      monthsDuration: subDuration
    };

    setSubscriptions(prev => [...prev, newSub]);
    
    // Automatically expand this client to show the added subscription
    setExpandedClients(prev => ({ ...prev, [selectedClientForSub.id]: true }));

    // Reset form
    setSubEmail('');
    setSubCustomService('');
    setSubService('Netflix');
    setSubDuration(1);
    setSelectedClientForSub(null);
    setShowAddSub(false);
  };

  const handleDeleteClient = (clientId: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${name}? Se borrarán también todas sus suscripciones en cascada.`)) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      setSubscriptions(prev => prev.filter(s => s.clientId !== clientId));
    }
  };

  const handleDeleteSubscription = (subId: number) => {
    if (window.confirm("¿Seguro que deseas eliminar esta cuenta de servicio?")) {
      setSubscriptions(prev => prev.filter(s => s.id !== subId));
    }
  };

  const handleResetData = () => {
    if (window.confirm("¿Restaurar los datos de demostración iniciales?")) {
      setClients(INITIAL_CLIENTS);
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
    }
  };

  // --- STATS ---
  const stats = (() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    subscriptions.forEach(sub => {
      const { status } = getSubscriptionStatus(sub.endDate);
      if (status === "ACTIVA") active++;
      if (status === "POR_VENCER") expiring++;
      if (status === "VENCIDA") expired++;
    });

    return { totalClients: clients.length, active, expiring, expired };
  })();

  // Filter clients based on search query
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Patin Deck Admin Services <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] text-neutral-400 border border-[#2a2a2a]">Offline Room DB</span>
              </h1>
              <p className="text-xs text-neutral-400 font-mono">Panel administrativo & Generador de Código para Android Jetpack Compose</p>
            </div>
          </div>

          {/* Selector de modo: Simulador interactivo / Ver código nativo */}
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#1f1f1f]">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'simulator' 
                  ? 'bg-blue-650 text-white shadow-md shadow-blue-900/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DeviceIcon className="w-4 h-4" />
              <span>Simulador Interactivo</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'code' 
                  ? 'bg-blue-650 text-white shadow-md shadow-blue-900/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Código Kotlin / Room</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* PESTAÑA DEL SIMULADOR INTERACTIVO */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LADO IZQUIERDO: DETALLES, GUÍA Y EXPLICACIÓN DE FUNCIONAMIENTO OFFLINE */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Info className="text-blue-500 w-5 h-5" /> ¿Cómo funciona este sistema?
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Patin Deck Admin Services es una solución robusta 100% offline pensada para que el administrador controle las suscripciones de servicios compartidos sin depender de servidores.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#161616] flex items-center justify-center text-xs font-mono text-blue-400 shrink-0 mt-0.5 border border-[#2a2a2a]">1</div>
                    <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Base de Datos SQLite Local:</strong> Usa Room para persistir clientes y cuentas contratadas, previniendo pérdida de datos.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#161616] flex items-center justify-center text-xs font-mono text-blue-400 shrink-0 mt-0.5 border border-[#2a2a2a]">2</div>
                    <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Cálculo de Fechas Automático:</strong> El administrador ingresa la duración (1 o 2 meses) y la app calcula la fecha exacta del fin del servicio sumándolo a la fecha actual.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#161616] flex items-center justify-center text-xs font-mono text-blue-400 shrink-0 mt-0.5 border border-[#2a2a2a]">3</div>
                    <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Alertas Inteligentes en Rojo:</strong> El dashboard compara en tiempo real las fechas actuales con el vencimiento, destacando clientes vencidos.</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#1f1f1f] flex items-center justify-between">
                  <span className="text-xs text-neutral-500">¿Quieres probar con los datos iniciales?</span>
                  <button 
                    onClick={handleResetData}
                    className="text-xs text-blue-500 hover:text-blue-400 underline font-medium transition"
                  >
                    Cargar Datos Demo
                  </button>
                </div>
              </div>

              {/* STATS DEL SISTEMA SIMULADO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Clientes Registrados</span>
                    <Users className="w-4 h-4 text-neutral-500" />
                  </div>
                  <span className="text-2xl font-bold text-white font-mono">{stats.totalClients}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Suscripciones Activas</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.active}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Próximas a Vencer</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-2xl font-bold text-amber-400 font-mono">{stats.expiring}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Cuentas Vencidas</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-2xl font-bold text-rose-500 font-mono">{stats.expired}</span>
                </div>
              </div>

              {/* BANNER RECOMENDADO PARA TRASPASAR A DISPOSITIVO */}
              <div className="bg-[#0e0e0e]/50 border border-[#1a1a1a] rounded-xl p-5 flex items-center justify-between shadow-md">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1 font-mono">Traspaso Directo</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Hemos generado toda la arquitectura del proyecto Android. Haz clic en la pestaña "Código Kotlin / Room" arriba para copiar directamente cada archivo al entorno oficial de Android Studio.
                  </p>
                </div>
              </div>

            </div>

            {/* LADO DERECHO: INTERFAZ MÓVIL SIMULADA */}
            <div className="lg:col-span-7 flex justify-center">
              
              {/* DISPOSITIVO MÓVIL FICTICIO (FRAME) */}
              <div className="w-full max-w-[430px] rounded-[48px] border-[10px] border-[#1f1f1f] bg-[#000] p-2 shadow-2xl relative overflow-hidden ring-1 ring-neutral-800">
                
                {/* Bocina o muesca de cámara superior */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0c0c0c] rounded-full z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
                </div>

                {/* Contenido de la Pantalla del Dashboard Android */}
                <div className="rounded-[38px] bg-[#050505] min-h-[640px] max-h-[720px] overflow-y-auto px-4 pt-8 pb-4 flex flex-col text-neutral-100 relative">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 px-3 py-1 mb-2 font-mono">
                    <span>09:41 AM</span>
                    <div className="flex gap-1.5 items-center">
                      <span>LTE</span>
                      <div className="w-4 h-2.5 bg-neutral-600 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Android TopAppBar */}
                  <div className="bg-[#0e0e0e]/95 rounded-2xl p-4 border border-[#1a1a1a] flex items-center justify-between mb-4 mt-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                      <span className="text-sm font-bold text-white tracking-wide">Patin Deck Admin</span>
                    </div>
                    <span className="text-[10px] bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded border border-blue-900/30 font-bold font-mono">PRO CONTROL</span>
                  </div>

                  {/* Buscador Integrado */}
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-600 transition font-sans"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* LISTA DE CLIENTES EN LA APP */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Clientes & Suscripciones</h4>
                      <span className="text-[10px] text-neutral-500 font-mono">{filteredClients.length} listados</span>
                    </div>

                    {filteredClients.length === 0 ? (
                      <div className="text-center py-12 bg-[#0e0e0e]/50 rounded-2xl border border-[#1f1f1f] border-dashed">
                        <Users className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                        <p className="text-xs text-neutral-400 font-medium">No se encontraron resultados</p>
                        <p className="text-[10px] text-neutral-600 mt-1">Intenta con otro término o agrega un cliente</p>
                      </div>
                    ) : (
                      filteredClients.map(client => {
                        const clientSubs = subscriptions.filter(sub => sub.clientId === client.id);
                        
                        // Check if client has expired/expiring soon
                        const hasExpired = clientSubs.some(s => getSubscriptionStatus(s.endDate).status === "VENCIDA");
                        const hasExpiring = clientSubs.some(s => getSubscriptionStatus(s.endDate).status === "POR_VENCER");

                        let borderClass = "border-[#1a1a1a] hover:border-[#2a2a2a]";
                        let statusMarkerColor = "bg-neutral-600";
                        if (clientSubs.length > 0) {
                          if (hasExpired) {
                            borderClass = "border-rose-900/55 bg-rose-950/10 shadow-inner";
                            statusMarkerColor = "bg-rose-600";
                          } else if (hasExpiring) {
                            borderClass = "border-amber-900/55 bg-amber-950/10";
                            statusMarkerColor = "bg-amber-500";
                          } else {
                            borderClass = "border-emerald-950/50 bg-emerald-950/5";
                            statusMarkerColor = "bg-emerald-500";
                          }
                        }

                        const isExpanded = expandedClients[client.id] || false;

                        return (
                          <div 
                            key={client.id}
                            className={`bg-[#0e0e0e]/95 rounded-xl border ${borderClass} transition-all duration-200 overflow-hidden`}
                          >
                            {/* Cabecera del item cliente */}
                            <div 
                              onClick={() => toggleExpand(client.id)}
                              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-900/40 transition select-none"
                            >
                              <div className="flex items-center gap-3">
                                {/* Avatar redondo */}
                                <div className={`w-8 h-8 rounded-full ${statusMarkerColor} bg-opacity-20 flex items-center justify-center font-bold text-xs`} style={{ color: hasExpired ? '#f43f5e' : hasExpiring ? '#f59e0b' : '#10b981' }}>
                                  {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-white leading-tight">{client.name}</h5>
                                  <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5 text-neutral-500" /> {client.phone}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {/* Botón agregar suscripción */}
                                <button
                                  onClick={() => {
                                    setSelectedClientForSub(client);
                                    setShowAddSub(true);
                                  }}
                                  title="Agregar Suscripción"
                                  className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                {/* Botón eliminar cliente */}
                                <button
                                  onClick={() => handleDeleteClient(client.id, client.name)}
                                  title="Eliminar Cliente"
                                  className="p-1 text-neutral-500 hover:text-rose-500 hover:bg-neutral-900 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Detalle expandido con suscripciones del cliente */}
                            {isExpanded && (
                              <div className="bg-[#050505]/60 px-3.5 pb-3.5 pt-1 border-t border-[#1a1a1a]">
                                {clientSubs.length === 0 ? (
                                  <p className="text-[10px] text-neutral-500 italic py-2">Sin suscripciones registradas.</p>
                                ) : (
                                  <div className="space-y-2 mt-1">
                                    {clientSubs.map(sub => {
                                      const statusInfo = getSubscriptionStatus(sub.endDate);
                                      return (
                                        <div 
                                          key={sub.id} 
                                          className={`p-2.5 rounded-lg border ${
                                            statusInfo.status === "VENCIDA" 
                                              ? "border-rose-950 bg-rose-950/10 text-rose-200" 
                                              : statusInfo.status === "POR_VENCER" 
                                                ? "border-amber-950 bg-amber-950/10 text-amber-200" 
                                                : "border-[#1a1a1a] bg-[#0c0c0c] text-emerald-200"
                                          } flex flex-col gap-1.5`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-white">{sub.serviceName}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                              statusInfo.status === "VENCIDA" 
                                                ? "bg-rose-500/20 text-rose-400" 
                                                : statusInfo.status === "POR_VENCER" 
                                                  ? "bg-amber-500/20 text-amber-400" 
                                                  : "bg-emerald-500/20 text-emerald-400"
                                            }`}>
                                              {statusInfo.status === "POR_VENCER" ? "Vence Pronto" : statusInfo.status}
                                            </span>
                                          </div>

                                          <div className="text-[10px] text-neutral-300 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-neutral-500 shrink-0" />
                                            <span className="truncate">{sub.email}</span>
                                          </div>

                                          <div className="flex items-center justify-between text-[9px] text-neutral-400 mt-0.5 pt-1 border-t border-neutral-900/40">
                                            <span>Fin: <strong className="text-neutral-300">{sub.endDate}</strong></span>
                                            <span className="font-semibold">
                                              {statusInfo.days < 0 
                                                ? `Venció hace ${Math.abs(statusInfo.days)} días` 
                                                : statusInfo.days === 0 
                                                  ? "Vence hoy" 
                                                  : `Faltan ${statusInfo.days} días`
                                              }
                                            </span>
                                          </div>

                                          <div className="flex justify-end pt-1">
                                            <button
                                              onClick={() => handleDeleteSubscription(sub.id)}
                                              className="text-[9px] text-neutral-500 hover:text-rose-400 flex items-center gap-1"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" /> Quitar Servicio
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Android Floating Action Button */}
                  <div className="mt-6 flex justify-end sticky bottom-2">
                    <button
                      onClick={() => setShowAddClient(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs transition"
                    >
                      <Plus className="w-4 h-4" /> Registrar Cliente
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* PESTAÑA DEL CODIGO FUENTE ANDROID */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            
            <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCode className="text-blue-500 w-5 h-5" /> Arquitectura Android Generada
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sigue la arquitectura estándar de Kotlin, Jetpack Compose y Room Database para garantizar el almacenamiento SQLite local y el cálculo de fechas nativo.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.keys(CODE_FILES).map((fileName) => {
                    const file = CODE_FILES[fileName as keyof typeof CODE_FILES];
                    const IconComp = file.icon;
                    return (
                      <button
                        key={fileName}
                        onClick={() => {
                          setActiveCodeFile(fileName as keyof typeof CODE_FILES);
                          setCopied(false);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeCodeFile === fileName 
                            ? 'bg-blue-650 text-white shadow-md' 
                            : 'bg-[#050505] text-neutral-400 hover:text-white border border-[#1f1f1f]'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{fileName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caja de Código */}
              <div className="relative rounded-xl overflow-hidden bg-[#050505] border border-[#1a1a1a]">
                
                {/* Cabecera de la caja con ruta */}
                <div className="bg-[#0e0e0e] px-4 py-2 border-b border-[#1a1a1a] flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>📂 {CODE_FILES[activeCodeFile].path}</span>
                  <button
                    onClick={() => handleCopyCode(CODE_FILES[activeCodeFile].code)}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Código
                      </>
                    )}
                  </button>
                </div>

                {/* Código formateado */}
                <pre className="p-4 overflow-x-auto text-xs font-mono text-neutral-300 max-h-[500px] leading-relaxed">
                  <code>{CODE_FILES[activeCodeFile].code}</code>
                </pre>
              </div>

              <div className="mt-4 bg-[#0e0e0e]/50 p-4 rounded-xl border border-[#1a1a1a] flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-400 space-y-1">
                  <p className="font-bold text-neutral-300">💡 Instrucciones de integración en Android Studio:</p>
                  <p>1. Asegúrate de tener habilitado Kapt en tu archivo <code className="text-neutral-200">build.gradle.kts</code> para procesar las anotaciones de Room.</p>
                  <p>2. Agrega los 3 archivos Kotlin (<code className="text-neutral-200">AppDatabase.kt</code>, <code className="text-neutral-200">AppViewModel.kt</code>, <code className="text-neutral-200">MainActivity.kt</code>) en tu paquete de código fuente bajo <code className="text-neutral-200">com.patindeck.adminservices</code>.</p>
                  <p>3. Compila la aplicación en tu emulador o dispositivo móvil físico Android y la base de datos se creará de forma automática en el primer arranque.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* --- FORM MODAL: AGREGAR CLIENTE --- */}
      <AnimatePresence>
        {showAddClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e0e0e] border border-[#1a1a1a] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 bg-[#141414]/40 border-b border-[#1a1a1a] flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Registrar Nuevo Cliente</h3>
                <button onClick={() => setShowAddClient(false)} className="text-neutral-400 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleAddClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Teléfono de Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +56 9 1234 5678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="px-4 py-2 bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 font-semibold rounded-xl text-xs transition border border-[#1a1a1a]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-900/10"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FORM MODAL: AGREGAR SUSCRIPCION --- */}
      <AnimatePresence>
        {showAddSub && selectedClientForSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e0e0e] border border-[#1a1a1a] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 bg-[#141414]/40 border-b border-[#1a1a1a] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Activar Suscripción</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Asignando servicio para: {selectedClientForSub.name}</p>
                </div>
                <button onClick={() => {
                  setSelectedClientForSub(null);
                  setShowAddSub(false);
                }} className="text-neutral-400 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleAddSubscription} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Seleccionar Servicio</label>
                  <select
                    value={subService}
                    onChange={(e) => setSubService(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 transition"
                  >
                    <option value="Netflix">Netflix</option>
                    <option value="Spotify Family">Spotify Family</option>
                    <option value="ChatGPT Plus">ChatGPT Plus</option>
                    <option value="Amazon Prime">Amazon Prime</option>
                    <option value="Disney+">Disney+</option>
                    <option value="YouTube Premium">YouTube Premium</option>
                    <option value="Otro">Otro servicio personalizado...</option>
                  </select>
                </div>

                {subService === 'Otro' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Nombre del Servicio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Paramount+"
                      value={subCustomService}
                      onChange={(e) => setSubCustomService(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Correo Electrónico Entregado</label>
                  <input
                    type="email"
                    required
                    placeholder="cuenta@correo.com"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Duración del Contrato</label>
                  <div className="grid grid-cols-2 gap-4 mt-1.5 font-sans">
                    <button
                      type="button"
                      onClick={() => setSubDuration(1)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                        subDuration === 1 
                          ? 'border-blue-600 bg-blue-600/10 text-white' 
                          : 'border-[#1a1a1a] bg-[#050505] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>1 Mes</span>
                      <span className="text-[9px] font-medium text-neutral-400 mt-0.5">Calculado hoy + 1 mes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubDuration(2)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                        subDuration === 2 
                          ? 'border-blue-600 bg-blue-600/10 text-white' 
                          : 'border-[#1a1a1a] bg-[#050505] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>2 Meses</span>
                      <span className="text-[9px] font-medium text-neutral-400 mt-0.5">Calculado hoy + 2 meses</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 leading-normal font-mono">
                  La app móvil Android calcula automáticamente el fin del periodo basándose en el calendario del sistema SQLite local.
                </p>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClientForSub(null);
                      setShowAddSub(false);
                    }}
                    className="px-4 py-2 bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 font-semibold rounded-xl text-xs transition border border-[#1a1a1a]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-900/10"
                  >
                    Activar Servicio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-[#1a1a1a] bg-[#050505] py-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Patin Deck Admin Services. 100% Offline Database Local SQLite & Jetpack Compose.</p>
        </div>
      </footer>

    </div>
  );
}
