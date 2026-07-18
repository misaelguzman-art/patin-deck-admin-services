package com.patindeck.adminservices

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
import androidx.compose.ui.window.Dialog
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFFE50914), // Rojo "Netflix" / Patin Deck
                    secondary = Color(0xFF1E1E1E),
                    background = Color(0xFF121212),
                    surface = Color(0xFF1D1D1D),
                    error = Color(0xFFCF6679),
                    onPrimary = Color.White,
                    onBackground = Color.White,
                    onSurface = Color.White
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DashboardScreen(viewModel)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(viewModel: AppViewModel) {
    val clientsList by viewModel.clientsWithSubscriptions.collectAsState()

    var showAddClientDialog by remember { mutableStateOf(false) }
    var showAddSubscriptionDialog by remember { mutableStateOf(false) }
    var selectedClientForSub by remember { mutableStateOf<Client?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    // Calcular estadísticas para las tarjetas superiores
    var totalClients = clientsList.size
    var activeCount = 0
    var expiringCount = 0
    var expiredCount = 0

    clientsList.forEach { clientWithSubs ->
        clientWithSubs.subscriptions.forEach { sub ->
            when (viewModel.getSubscriptionStatus(sub.endDate)) {
                SubscriptionStatus.ACTIVA -> activeCount++
                SubscriptionStatus.POR_VENCER -> expiringCount++
                SubscriptionStatus.VENCIDA -> expiredCount++
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBike, // Simboliza el "Patin" de Patin Deck
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Patin Deck Admin",
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 20.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddClientDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Agregar Cliente")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Buscador
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Buscar cliente...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tarjetas de Estadísticas (Fila Scrolleable o Distribución en Caja)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Clientes",
                    value = totalClients.toString(),
                    color = Color.Gray,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Activas",
                    value = activeCount.toString(),
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Por Vencer",
                    value = expiringCount.toString(),
                    color = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Vencidas",
                    value = expiredCount.toString(),
                    color = Color(0xFFF44336),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Clientes y Suscripciones",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            val filteredClients = if (searchQuery.isBlank()) {
                clientsList
            } else {
                clientsList.filter {
                    it.client.name.contains(searchQuery, ignoreCase = true) ||
                    it.client.phone.contains(searchQuery)
                }
            }

            if (filteredClients.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No se encontraron clientes.",
                        color = Color.Gray,
                        fontSize = 15.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredClients) { clientWithSubs ->
                        ClientItem(
                            clientWithSubs = clientWithSubs,
                            viewModel = viewModel,
                            onAddSubscriptionClick = {
                                selectedClientForSub = clientWithSubs.client
                                showAddSubscriptionDialog = true
                            },
                            onDeleteClientClick = {
                                viewModel.deleteClient(clientWithSubs.client)
                            }
                        )
                    }
                }
            }
        }
    }

    // DIALOGO AGREGAR CLIENTE
    if (showAddClientDialog) {
        AddClientDialog(
            onDismiss = { showAddClientDialog = false },
            onSave = { name, phone ->
                viewModel.insertClient(name, phone)
                showAddClientDialog = false
            }
        )
    }

    // DIALOGO AGREGAR SUSCRIPCION
    if (showAddSubscriptionDialog && selectedClientForSub != null) {
        AddSubscriptionDialog(
            client = selectedClientForSub!!,
            onDismiss = {
                showAddSubscriptionDialog = false
                selectedClientForSub = null
            },
            onSave = { service, email, months ->
                viewModel.insertSubscription(selectedClientForSub!!.clientId, service, email, months)
                showAddSubscriptionDialog = false
                selectedClientForSub = null
            }
        )
    }
}

@Composable
fun StatCard(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ClientItem(
    clientWithSubs: ClientWithSubscriptions,
    viewModel: AppViewModel,
    onAddSubscriptionClick: () -> Unit,
    onDeleteClientClick: () -> Unit
) {
    var isExpanded by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf(false) }

    // Determinar si el cliente tiene alguna alerta (suscripción vencida o por vencer)
    val hasAlert = clientWithSubs.subscriptions.any { sub ->
        val status = viewModel.getSubscriptionStatus(sub.endDate)
        status == SubscriptionStatus.VENCIDA || status == SubscriptionStatus.POR_VENCER
    }

    // Color del borde o indicador del cliente según el estado
    val statusColor = if (clientWithSubs.subscriptions.isEmpty()) {
        Color.Gray
    } else if (clientWithSubs.subscriptions.any { viewModel.getSubscriptionStatus(it.endDate) == SubscriptionStatus.VENCIDA }) {
        Color(0xFFE50914) // Rojo: Vencido
    } else if (clientWithSubs.subscriptions.any { viewModel.getSubscriptionStatus(it.endDate) == SubscriptionStatus.POR_VENCER }) {
        Color(0xFFFF9800) // Naranja: Por vencer
    } else {
        Color(0xFF4CAF50) // Verde: Activo
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(
                onClick = { isExpanded = !isExpanded },
                onLongClick = { showDeleteConfirm = true }
            ),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        border = CardDefaults.outlinedCardBorder(enabled = true).copy(
            width = if (hasAlert) 1.5.dp else 0.5.dp,
            brush = androidx.compose.ui.graphics.SolidColor(statusColor)
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Fila Principal del Cliente
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Avatar con inicial
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(statusColor.copy(alpha = 0.15f), RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = clientWithSubs.client.name.take(1).uppercase(),
                        fontWeight = FontWeight.Bold,
                        color = statusColor,
                        fontSize = 18.sp
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Información del Cliente
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = clientWithSubs.client.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                    Text(
                        text = "📞 ${clientWithSubs.client.phone}",
                        fontSize = 13.sp,
                        color = Color.LightGray
                    )
                }

                IconButton(onClick = onAddSubscriptionClick) {
                    Icon(
                        imageVector = Icons.Default.AddBox,
                        contentDescription = "Añadir Suscripción",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }

                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }

            // Sección Expandible de Suscripciones
            if (isExpanded) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Color.DarkGray)
                Spacer(modifier = Modifier.height(8.dp))

                if (clientWithSubs.subscriptions.isEmpty()) {
                    Text(
                        text = "Sin suscripciones activas. Haz clic en '+' para agregar una.",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                } else {
                    clientWithSubs.subscriptions.forEach { sub ->
                        val status = viewModel.getSubscriptionStatus(sub.endDate)
                        val daysRemaining = viewModel.getDaysRemaining(sub.endDate)

                        val (statusText, badgeColor) = when (status) {
                            SubscriptionStatus.ACTIVA -> "Activa" to Color(0xFF4CAF50)
                            SubscriptionStatus.POR_VENCER -> "Vence pronto" to Color(0xFFFF9800)
                            SubscriptionStatus.VENCIDA -> "VENCIDA" to Color(0xFFE50914)
                        }

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .background(Color.Black.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = sub.serviceName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                // Badge del estado
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = badgeColor.copy(alpha = 0.15f)),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = statusText.uppercase(),
                                        color = badgeColor,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = "✉️ ${sub.email}", fontSize = 12.sp, color = Color.LightGray)
                            Spacer(modifier = Modifier.height(2.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Vence: ${sub.endDate}",
                                    fontSize = 12.sp,
                                    color = if (status == SubscriptionStatus.VENCIDA) Color(0xFFCF6679) else Color.Gray
                                )
                                Text(
                                    text = if (daysRemaining < 0) "Venció hace ${-daysRemaining} días" else "Faltan $daysRemaining días",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = badgeColor
                                )
                            }
                            
                            // Botón para eliminar suscripción particular (opción al mantener presionado o botón)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                TextButton(
                                    onClick = { viewModel.deleteSubscription(sub) },
                                    colors = ButtonDefaults.textButtonColors(contentColor = Color.Gray)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Quitar cuenta", fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Alerta de confirmación para eliminar cliente entero
    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("¿Eliminar cliente?") },
            text = { Text("Se eliminará a ${clientWithSubs.client.name} y todas sus suscripciones registradas. Esta acción no se puede deshacer.") },
            confirmButton = {
                Button(
                    onClick = {
                        onDeleteClientClick()
                        showDeleteConfirm = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

// --- FORMULARIOS / DIALOGOS ---

@Composable
fun AddClientDialog(onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Registrar Nuevo Cliente") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nombre Completo") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Teléfono de Contacto") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(name, phone) },
                enabled = name.isNotBlank() && phone.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun AddSubscriptionDialog(
    client: Client,
    onDismiss: () -> Unit,
    onSave: (String, String, Int) -> Unit
) {
    var serviceName by remember { mutableStateOf("Netflix") }
    var email by remember { mutableStateOf("") }
    var monthsDuration by remember { mutableIntStateOf(1) }

    val services = listOf("Netflix", "Spotify", "ChatGPT", "Amazon Prime", "Disney+", "YouTube Premium", "Otro")
    var isDropdownExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Agregar Suscripción a ${client.name}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Selector de servicio
                Box {
                    OutlinedButton(
                        onClick = { isDropdownExpanded = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Servicio: $serviceName")
                    }
                    DropdownMenu(
                        expanded = isDropdownExpanded,
                        onDismissRequest = { isDropdownExpanded = false }
                    ) {
                        services.forEach { service ->
                            DropdownMenuItem(
                                text = { Text(service) },
                                onClick = {
                                    serviceName = service
                                    isDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                // Si selecciona "Otro", permitir que escriba
                if (serviceName == "Otro") {
                    var customService by remember { mutableStateOf("") }
                    OutlinedTextField(
                        value = customService,
                        onValueChange = { 
                            customService = it
                            // Guardar el nombre personalizado temporalmente
                        },
                        label = { Text("Nombre del servicio personalizado") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    // Vincular el customService para retornar al guardar
                    DisposableEffect(customService) {
                        onDispose {}
                    }
                }

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Correo electrónico entregado") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Selección de Duración (1 o 2 meses)
                Column {
                    Text("Duración de la Suscripción", fontSize = 12.sp, color = Color.Gray)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = monthsDuration == 1,
                                onClick = { monthsDuration = 1 }
                            )
                            Text("1 Mes")
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = monthsDuration == 2,
                                onClick = { monthsDuration = 2 }
                            )
                            Text("2 Meses")
                        }
                    }
                }

                Text(
                    text = "Nota: La fecha de vencimiento se calculará sumando automáticamente los meses seleccionados a partir de hoy.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { 
                    // Asegurar que si es "Otro", use el valor correspondiente o "Otro"
                    onSave(serviceName, email, monthsDuration) 
                },
                enabled = email.isNotBlank() && serviceName.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Activar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
