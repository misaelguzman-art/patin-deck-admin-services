package com.patindeck.adminservices

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).appDao()

    // Flujo de clientes con todas sus suscripciones en tiempo real
    val clientsWithSubscriptions: StateFlow<List<ClientWithSubscriptions>> = dao.getAllClientsWithSubscriptions()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Formateador de fecha estándar
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    /**
     * Registra un nuevo cliente en la base de datos
     */
    fun insertClient(name: String, phone: String, onSuccess: (Long) -> Unit = {}) {
        viewModelScope.launch {
            if (name.isNotBlank() && phone.isNotBlank()) {
                val client = Client(name = name.trim(), phone = phone.trim())
                val newId = dao.insertClient(client)
                onSuccess(newId)
            }
        }
    }

    /**
     * Registra una suscripción para un cliente.
     * Calcula automáticamente la fecha de vencimiento sumando 1 o 2 meses a la fecha actual.
     */
    fun insertSubscription(
        clientId: Long,
        serviceName: String,
        email: String,
        monthsDuration: Int
    ) {
        viewModelScope.launch {
            if (serviceName.isNotBlank() && email.isNotBlank() && (monthsDuration == 1 || monthsDuration == 2)) {
                val today = LocalDate.now()
                // Sumar los meses correspondientes
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

    /**
     * Elimina un cliente y todas sus suscripciones en cascada
     */
    fun deleteClient(client: Client) {
        viewModelScope.launch {
            dao.deleteClient(client)
        }
    }

    /**
     * Elimina una suscripción específica
     */
    fun deleteSubscription(subscription: Subscription) {
        viewModelScope.launch {
            dao.deleteSubscription(subscription)
        }
    }

    /**
     * Determina el estado de una suscripción según la fecha actual.
     * - "VENCIDA": Si la fecha de vencimiento es anterior a hoy.
     * - "POR_VENCER": Si vence hoy o dentro de los próximos 7 días.
     * - "ACTIVA": Si vence en más de 7 días.
     */
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

    /**
     * Calcula cuántos días faltan para que venza la suscripción.
     * Devuelve un valor negativo si ya venció.
     */
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

// --- ENUM PARA EL ESTADO DE LA SUSCRIPCIÓN ---
enum class SubscriptionStatus {
    ACTIVA,
    POR_VENCER, // 0 a 7 días para vencer
    VENCIDA     // Ya pasó la fecha de vencimiento
}
