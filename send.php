<?php
/**
 * Milan Club Marmirolo - Script PHP Ricezione e Invio Dati Socio via Email
 * Da utilizzare se si carica il modulo su un hosting con supporto PHP (es. Aruba, Altervista, cPanel).
 */

header('Content-Type: application/json; charset=utf-8');

// Configurazione indirizzo di destinazione
$destinatario = "milanclubmarmirolo@gmail.com";

// Consenti solo richieste POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo non consentito. Utilizzare POST.']);
    exit;
}

// Lettura dati da POST o JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data) {
    $data = $_POST;
}

// Estrazione e pulizia dati
$ruolo          = htmlspecialchars($data['ruolo'] ?? $data['Ruolo_Club'] ?? 'Socio');
$nome           = htmlspecialchars($data['nome'] ?? $data['Nome'] ?? '');
$cognome        = htmlspecialchars($data['cognome'] ?? $data['Cognome'] ?? '');
$email          = filter_var($data['email'] ?? $data['Email_Socio'] ?? '', FILTER_SANITIZE_EMAIL);
$data_nascita   = htmlspecialchars($data['data_nascita'] ?? $data['Data_Nascita'] ?? '');
$luogo_nascita  = htmlspecialchars($data['luogo_nascita'] ?? $data['Luogo_Nascita'] ?? '');
$indirizzo      = htmlspecialchars($data['indirizzo'] ?? $data['Indirizzo'] ?? '');
$civico         = htmlspecialchars($data['civico'] ?? '');
$cap            = htmlspecialchars($data['cap'] ?? $data['CAP'] ?? '');
$localita       = htmlspecialchars($data['localita'] ?? $data['Localita'] ?? '');
$provincia      = htmlspecialchars($data['provincia'] ?? $data['Provincia'] ?? '');
$codice_fiscale = htmlspecialchars($data['codice_fiscale'] ?? $data['Codice_Fiscale'] ?? '');
$cellulare      = htmlspecialchars($data['cellulare'] ?? $data['Telefono_Cellulare'] ?? '');
$tipo_op        = htmlspecialchars($data['tipo_operazione'] ?? $data['Tipo_Operazione'] ?? 'Tesseramento');
$note           = htmlspecialchars($data['note'] ?? $data['Note'] ?? 'Nessuna');

if (empty($nome) || empty($cognome) || empty($email) || empty($codice_fiscale)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dati obbligatori mancanti.']);
    exit;
}

// Oggetto dell'email
$oggetto = "Scheda Socio: $nome $cognome ($ruolo) - Milan Club Marmirolo";

// Corpo email in formato HTML
$messaggioHTML = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #d00000; color: #ffffff; padding: 18px 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 20px 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
    th { color: #666; width: 38%; font-weight: normal; background-color: #fafafa; }
    td { font-weight: bold; color: #111; }
    .footer { font-size: 12px; color: #888; text-align: center; padding: 15px; background: #f9f9f9; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h2>MILAN CLUB MARMIROLO</h2>
      <p>Nuova Scheda Dati Socio Ricevuta</p>
    </div>
    <div class='content'>
      <table>
        <tr><th>Qualifica / Ruolo</th><td>$ruolo</td></tr>
        <tr><th>Nome e Cognome</th><td>$nome $cognome</td></tr>
        <tr><th>Codice Fiscale</th><td>$codice_fiscale</td></tr>
        <tr><th>Data di Nascita</th><td>$data_nascita</td></tr>
        <tr><th>Luogo di Nascita</th><td>$luogo_nascita</td></tr>
        <tr><th>Indirizzo Residenza</th><td>$indirizzo" . (!empty($civico) ? " n. $civico" : "") . "</td></tr>
        <tr><th>CAP, Comune (Prov)</th><td>$cap $localita ($provincia)</td></tr>
        <tr><th>Email</th><td><a href='mailto:$email'>$email</a></td></tr>
        <tr><th>Cellulare</th><td><a href='tel:$cellulare'>$cellulare</a></td></tr>
        <tr><th>Operazione</th><td>$tipo_op</td></tr>
        <tr><th>Note</th><td>" . nl2br($note) . "</td></tr>
      </table>
    </div>
    <div class='footer'>
      Email inviata automaticamente dal modulo online del Milan Club Marmirolo.
    </div>
  </div>
</body>
</html>
";

// Headers email
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Milan Club Marmirolo <noreply@' . ($_SERVER['SERVER_NAME'] ?? 'milanclubmarmirolo.it') . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// Invio effettivo
$inviata = mail($destinatario, $oggetto, $messaggioHTML, implode("\r\n", $headers));

if ($inviata) {
    echo json_encode([
        'success' => true,
        'message' => "I dati di $nome $cognome sono stati inviati con successo a $destinatario"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "Errore durante l'invio dell'email dal server."
    ]);
}
