import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  // 🔁 Replace with your actual backend URL
  static const String _url = 'http://10.0.2.2:5016/graphql';

  //  LOGIN 
  // Sends email + password to C# backend, gets back a JWT token
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    // This is the GraphQL query your backend expects
    const String loginQuery = '''
      mutation Login(\$email: String!, \$password: String!) {
        loginUser(input: { email: \$email, password: \$password }) {
          token
          user {
            id
            fullName
            email
          }
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'query': loginQuery,
        'variables': {'email': email, 'password': password},
      }),
    );

    final data = jsonDecode(response.body);

    // If GraphQL returns errors, throw them
    if (data['errors'] != null) {
      throw Exception(data['errors'][0]['message']);
    }

    return data['data']['loginUser']; // { token, user }
  }

  // SIGN UP 
  // Sends name + email + password to C# backend to create account
  static Future<Map<String, dynamic>> register(
    String fullName,
    String email,
    String password,
  ) async {
    const String registerMutation = '''
      mutation Register(\$fullName: String!, \$email: String!, \$password: String!) {
        registerUser(input: { fullName: \$fullName, email: \$email, password: \$password }) {
          id
          fullName
          email
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'query': registerMutation,
        'variables': {
          'fullName': fullName,
          'email': email,
          'password': password,
        },
      }),
    );

    final data = jsonDecode(response.body);

    if (data['errors'] != null) {
      throw Exception(data['errors'][0]['message']);
    }

    return data['data']['registerUser']; // { id, fullName, email }
  }
}
