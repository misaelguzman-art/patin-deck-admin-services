package com.patindeck.adminservices

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
    val serviceName: String,     // Ej: "Netflix", "Spotify", "ChatGPT"
    val email: String,           // Correo entregado
    val startDate: String,       // Formato ISO: "YYYY-MM-DD"
    val endDate: String,         // Formato ISO: "YYYY-MM-DD"
    val monthsDuration: Int      // 1 o 2 meses
)

// --- RELACIÓN PARA CONSOLIDAR DATOS ---

data class ClientWithSubscriptions(
    @Embedded val client: Client,
    @Relation(
        parentColumn = "clientId",
        entityColumn = "clientId"
    )
    val subscriptions: List<Subscription>
)

// --- DAO (DATA ACCESS OBJECT) ---

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

    @Query("SELECT * FROM subscriptions WHERE clientId = :clientId")
    fun getSubscriptionsForClient(clientId: Long): Flow<List<Subscription>>

    @Delete
    suspend fun deleteClient(client: Client)

    @Delete
    suspend fun deleteSubscription(subscription: Subscription)
}

// --- CONFIGURACIÓN DE LA BASE DE DATOS ROOM ---

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
                .fallbackToDestructiveMigration() // Manejo simple de cambios de esquema
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
