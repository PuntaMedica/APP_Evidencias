from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
# --- CÓDIGO ANTERIOR COMENTADO ---
# import pymysql  # Cambiado de mysql.connector a pymysql
# from pymysql.cursors import DictCursor  # Para obtener resultados como diccionarios

# --- NUEVO CÓDIGO SQL SERVER ---
import pyodbc 
import os
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import pytz  # Para manejar zonas horarias

app = Flask(__name__)

# Configuración de CORS para permitir encabezados Authorization
CORS(app, supports_credentials=True, expose_headers=["Authorization"], allow_headers=["Content-Type", "Authorization"])

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'tu_clave_secreta_aqui'  # Cambia esto a una clave segura
jwt = JWTManager(app)

# Configuración de la base de datos
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de tipos de archivos permitidos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# --- NUEVA CONFIGURACIÓN SQL SERVER ---
SQL_CONN_STR = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=DESKTOP-EO74OCH\\SQLEXPRESS;"
    "Database=gestion_imagenes;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db():
    """Obtiene la conexión a la base de datos para la solicitud actual."""
    if 'db' not in g:
        # --- CÓDIGO ANTERIOR COMENTADO ---
        # g.db = pymysql.connect(
        #     host="localhost",
        #     user="root",
        #     password="PuntaMedica",
        #     database="gestion_imagenes",
        #     cursorclass=DictCursor
        # )
        
        # --- NUEVO CÓDIGO SQL SERVER ---
        g.db = pyodbc.connect(SQL_CONN_STR)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """Cierra la conexión a la base de datos al final de la solicitud."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def ping_connection(db):
    """Verifica y reconecta la conexión a la base de datos si es necesario."""
    # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
    # try:
    #     db.ping(reconnect=True)
    # except pymysql.MySQLError as err:
    #     print(f"Error al intentar reconectar: {err}")
    
    # --- NOTA SQL SERVER: pyodbc maneja la conexión de forma distinta, 
    # generalmente no requiere un ping manual por request en Trusted_Connection
    pass

# ===================== INICIALIZACIÓN DE TABLAS SQL SERVER =====================
def init_sql_tables():
    db = get_db()
    cursor = db.cursor()
    # Tabla user ([user] por ser palabra reservada)
    cursor.execute('''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user' AND xtype='U')
        CREATE TABLE [user] (
            id INT IDENTITY(1,1) PRIMARY KEY,
            username VARCHAR(100) UNIQUE,
            nombre VARCHAR(255),
            departamento VARCHAR(100),
            password_hash VARCHAR(MAX),
            role VARCHAR(50)
        )
    ''')
    # Tabla imagenes
    cursor.execute('''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='imagenes' AND xtype='U')
        CREATE TABLE imagenes (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT,
            piso VARCHAR(50),
            nombre_archivo VARCHAR(255),
            ruta_archivo VARCHAR(MAX),
            fecha_subida DATETIME,
            fecha_modificacion DATETIME
        )
    ''')
    # Tabla car_images
    cursor.execute('''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='car_images' AND xtype='U')
        CREATE TABLE car_images (
            id INT IDENTITY(1,1) PRIMARY KEY,
            plate VARCHAR(50),
            section VARCHAR(100),
            image_path VARCHAR(MAX),
            user_id INT,
            upload_date DATETIME DEFAULT GETDATE()
        )
    ''')
    db.commit()

# Ruta de Registro de Usuarios
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nombre = data.get('nombre')
    departamento = data.get('departamento')
    username = data.get('username')
    password = data.get('password')

    if not all([nombre, departamento, username, password]):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    db = get_db()
    ping_connection(db)
    cursor = db.cursor()

    # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
    # cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
    
    # --- NUEVO CÓDIGO SQL SERVER ---
    cursor.execute("SELECT username FROM [user] WHERE username = ?", (username,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        return jsonify({"error": "El usuario ya existe"}), 400

    # Hashear la contraseña
    password_hash = generate_password_hash(password)

    # Asignar rol de 'User' por defecto
    role = 'Admin' if username.lower() == 'admin' else 'User'

    # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
    # cursor.execute(
    #     "INSERT INTO user (username, nombre, departamento, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
    #     (username, nombre, departamento, password_hash, role)
    # )
    
    # --- NUEVO CÓDIGO SQL SERVER ---
    cursor.execute(
        "INSERT INTO [user] (username, nombre, departamento, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        (username, nombre, departamento, password_hash, role)
    )
    db.commit()

    return jsonify({"message": "Usuario registrado exitosamente"}), 201

# Ruta de Login de Usuarios
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    db = get_db()
    ping_connection(db)
    cursor = db.cursor()

    # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
    # cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
    
    # --- NUEVO CÓDIGO SQL SERVER ---
    cursor.execute("SELECT username, password_hash, role FROM [user] WHERE username = ?", (username,))
    user = cursor.fetchone()

    # En pyodbc el acceso es por posición o atributo si se configura, 
    # pero aquí validamos contra el objeto retornado
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Crear el token JWT con identity como username y role como reclamo adicional
    access_token = create_access_token(identity=user.username, additional_claims={"role": user.role})

    return jsonify({"access_token": access_token}), 200

# Ruta para obtener imágenes
@app.route('/images', methods=['GET'])
@jwt_required()
def get_images():
    try:
        current_user = get_jwt_identity()
        db = get_db()
        ping_connection(db)
        cursor = db.cursor()

        # Obtener el rol del usuario
        # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
        # cursor.execute("SELECT role FROM user WHERE username = %s", (current_user,))
        
        # --- NUEVO CÓDIGO SQL SERVER ---
        cursor.execute("SELECT role FROM [user] WHERE username = ?", (current_user,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        role = user.role

        if role == 'Admin':
            # Obtener todas las imágenes incluyendo el nombre del usuario
            # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
            # cursor.execute("""
            #     SELECT imagenes.*, user.nombre as usuario_nombre 
            #     FROM imagenes 
            #     JOIN user ON imagenes.user_id = user.id
            # """)
            
            # --- NUEVO CÓDIGO SQL SERVER ---
            cursor.execute("""
                SELECT i.*, u.nombre as usuario_nombre 
                FROM imagenes i
                JOIN [user] u ON i.user_id = u.id
            """)
        else:
            # Obtener solo las imágenes del usuario
            # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
            # cursor.execute("""
            #     SELECT imagenes.*, user.nombre as usuario_nombre 
            #     FROM imagenes 
            #     JOIN user ON imagenes.user_id = user.id 
            #     WHERE user.username = %s
            # """, (current_user,))
            
            # --- NUEVO CÓDIGO SQL SERVER ---
            cursor.execute("""
                SELECT i.*, u.nombre as usuario_nombre 
                FROM imagenes i
                JOIN [user] u ON i.user_id = u.id 
                WHERE u.username = ?
            """, (current_user,))
            
        # Mapeo manual para emular DictCursor de MySQL
        columns = [column[0] for column in cursor.description]
        images = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify(images), 200
    except Exception as e:
        print(f"Error al obtener imágenes: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# Ruta para subir imágenes (Protegida)
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        auth_header = request.headers.get('Authorization')
        print(f"Authorization Header: {auth_header}")  # Verificar si el token se recibe
        current_user = get_jwt_identity()
        print(f"Usuario actual: {current_user}")  # Verificar el usuario actual

        if not current_user:
            return jsonify({"error": "No autorizado"}), 401

        if 'file' not in request.files:
            return jsonify({"error": "No hay archivo en la solicitud"}), 400

        files = request.files.getlist('file')  # Obtener lista de archivos
        last_modified_list = request.form.getlist('last_modified')  # Obtener lista de fechas de modificación
        piso = request.form.get('piso', 'Piso 1')

        if not files:
            return jsonify({"error": "No se seleccionaron archivos"}), 400

        if len(files) != len(last_modified_list):
            return jsonify({"error": "El número de archivos no coincide con el número de fechas de modificación"}), 400

        db = get_db()
        ping_connection(db)
        cursor = db.cursor()

        # Obtener el user_id del usuario actual
        # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
        # cursor.execute("SELECT id FROM user WHERE username = %s", (current_user,))
        
        # --- NUEVO CÓDIGO SQL SERVER ---
        cursor.execute("SELECT id FROM [user] WHERE username = ?", (current_user,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        user_id = user.id

        uploaded_files = []
        for file, last_modified_str in zip(files, last_modified_list):
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = f"/uploads/{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

                try:
                    last_modified_timestamp = int(last_modified_str) / 1000.0  # Convertir a segundos
                    last_modified_datetime = datetime.datetime.fromtimestamp(last_modified_timestamp, pytz.UTC)
                except (ValueError, TypeError):
                    last_modified_datetime = datetime.datetime.now(pytz.UTC)

                fecha_subida = datetime.datetime.now(pytz.UTC)

                # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
                # cursor.execute(
                #     "INSERT INTO imagenes (user_id, piso, nombre_archivo, ruta_archivo, fecha_subida, fecha_modificacion) VALUES (%s, %s, %s, %s, %s, %s)",
                #     (user_id, piso, filename, filepath, fecha_subida, last_modified_datetime)
                # )
                
                # --- NUEVO CÓDIGO SQL SERVER ---
                cursor.execute(
                    "INSERT INTO imagenes (user_id, piso, nombre_archivo, ruta_archivo, fecha_subida, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, piso, filename, filepath, fecha_subida, last_modified_datetime)
                )
                uploaded_files.append(filename)
            else:
                return jsonify({"error": f"Tipo de archivo no permitido: {file.filename}"}), 400

        db.commit()
        return jsonify({"message": f"Se subieron exitosamente {len(uploaded_files)} imágenes"}), 200

    except Exception as e:
        print(f"Error en upload_image: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# Ruta para servir imágenes
@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Ruta para subir imágenes de los carros
@app.route('/upload_car_images', methods=['POST'])
@jwt_required()
def upload_car_images():
    try:
        current_user = get_jwt_identity()
        db = get_db()
        ping_connection(db)
        cursor = db.cursor()

        # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
        # cursor.execute("SELECT role FROM user WHERE username = %s", (current_user,))
        
        # --- NUEVO CÓDIGO SQL SERVER ---
        cursor.execute("SELECT role FROM [user] WHERE username = ?", (current_user,))
        user = cursor.fetchone()
        
        if not user or user.role not in ['Admin', 'coches']:
            return jsonify({"error": "No autorizado"}), 403

        data = request.form
        plate = data.get('plate')
        files = request.files.getlist('images')  # Todas las imágenes
        sections = ['Delantero', 'Trasero', 'Lateral Izquierdo', 'Lateral Derecho']

        if not plate or len(files) != 4:
            return jsonify({"error": "Debe proporcionar la placa y las 4 imágenes obligatorias"}), 400

        uploaded_files = []
        for file, section in zip(files, sections):
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = f"/uploads/{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

                # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
                # cursor.execute(
                #     "INSERT INTO car_images (plate, section, image_path, user_id) VALUES (%s, %s, %s, (SELECT id FROM user WHERE username = %s))",
                #     (plate, section, filepath, current_user)
                # )
                
                # --- NUEVO CÓDIGO SQL SERVER ---
                cursor.execute("""
                    INSERT INTO car_images (plate, section, image_path, user_id) 
                    VALUES (?, ?, ?, (SELECT id FROM [user] WHERE username = ?))
                """, (plate, section, filepath, current_user))
                
                uploaded_files.append(section)

        db.commit()
        return jsonify({"message": f"Imágenes subidas exitosamente para las secciones: {', '.join(uploaded_files)}"}), 200

    except Exception as e:
        print(f"Error en upload_car_images: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/get_car_images', methods=['GET'])
@jwt_required()
def get_car_images():
    try:
        current_user = get_jwt_identity()
        db = get_db()
        ping_connection(db)
        cursor = db.cursor()

        # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
        # cursor.execute("SELECT role FROM user WHERE username = %s", (current_user,))
        
        # --- NUEVO CÓDIGO SQL SERVER ---
        cursor.execute("SELECT role FROM [user] WHERE username = ?", (current_user,))
        user = cursor.fetchone()
        
        if not user or user.role != 'Admin':
            return jsonify({"error": "No autorizado"}), 403

        plate = request.args.get('plate')
        date = request.args.get('date')

        query = "SELECT * FROM car_images WHERE 1=1"
        params = []

        if plate:
            # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
            # query += " AND plate = %s"
            
            # --- NUEVO CÓDIGO SQL SERVER ---
            query += " AND plate = ?"
            params.append(plate)

        if date:
            # --- CÓDIGO ANTERIOR COMENTADO (MySQL) ---
            # query += " AND DATE(upload_date) = %s"
            
            # --- NUEVO CÓDIGO SQL SERVER ---
            query += " AND CAST(upload_date AS DATE) = ?"
            params.append(date)

        cursor.execute(query, tuple(params))
        
        # Mapeo manual para emular DictCursor
        columns = [column[0] for column in cursor.description]
        images = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return jsonify(images), 200

    except Exception as e:
        print(f"Error al obtener las imágenes: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    # Inicializar tablas al arrancar
    with app.app_context():
        init_sql_tables()
    app.run(host='0.0.0.0', port=5100, debug=True)