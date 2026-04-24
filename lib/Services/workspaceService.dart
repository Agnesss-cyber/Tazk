import 'dart:convert';
import 'package:http/http.dart' as http;

class WorkspaceService {
  static const String _url = 'http://10.0.2.2:5016/graphql';

  // Fetch all workspaces for a user
  static Future<List<dynamic>> getWorkspaces(int userId, String token) async {
    const String query = '''
      query GetWorkspaces(\$userId: Int!) {
        workspaces(where: { members: { some: { userId: { eq: \$userId } } } }) {
          id
          name
          type
          members {
            userId
            role
          }
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': query,
        'variables': {'userId': userId},
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
    return data['data']['workspaces'];
  }

  // Create a new workspace
  static Future<Map<String, dynamic>> createWorkspace(
    String name,
    String type,
    int ownerId,
    String token,
  ) async {
    const String mutation = '''
      mutation CreateWorkspace(\$name: String!, \$ownerId: Int!, \$type: WorkspaceType!) {
        createWorkspace(input: { name: \$name, ownerId: \$ownerId, type: \$type }) {
          id
          name
          type
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': mutation,
        'variables': {
          'name': name,
          'ownerId': ownerId,
          'type': type.toUpperCase(),
        },
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
    return data['data']['createWorkspace'];
  }

  // Send invite to a workspace
  static Future<void> sendInvite(
    int workspaceId,
    String email,
    String token,
  ) async {
    const String mutation = '''
      mutation SendInvitation(\$workspaceId: Int!, \$email: String!) {
        sendInvitation(input: { workspaceId: \$workspaceId, email: \$email }) {
          id
          email
          status
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': mutation,
        'variables': {'workspaceId': workspaceId, 'email': email},
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
  }

  // ✅ Fetch pending invitations for the logged-in user
  static Future<List<dynamic>> getInvitations(String token) async {
    const String query = '''
      query GetMyInvitations {
        myInvitations {
          id
          email
          status
          workspace {
            id
            name
          }
          invitedBy {
            id
            fullName
          }
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'query': query}),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
    return data['data']['myInvitations'];
  }

  // ✅ Accept an invitation
  static Future<void> acceptInvitation(int invitationId, String token) async {
    const String mutation = '''
      mutation AcceptInvitation(\$id: Int!) {
        acceptInvitation(input: { id: \$id }) {
          id
          status
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': mutation,
        'variables': {'id': invitationId},
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
  }

  // ✅ Decline an invitation
  static Future<void> declineInvitation(int invitationId, String token) async {
    const String mutation = '''
      mutation DeclineInvitation(\$id: Int!) {
        declineInvitation(input: { id: \$id }) {
          id
          status
        }
      }
    ''';

    final response = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': mutation,
        'variables': {'id': invitationId},
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
  }

  // ✅ Fetch members of a workspace
  static Future<List<dynamic>> getMembers(int workspaceId, String token) async {
    const String query = '''
      query GetMembers(\$workspaceId: Int!) {
        workspaceMembers(workspaceId: \$workspaceId) {
          userId
          role
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'query': query,
        'variables': {'workspaceId': workspaceId},
      }),
    );

    final data = jsonDecode(response.body);
    if (data['errors'] != null) throw Exception(data['errors'][0]['message']);
    return data['data']['workspaceMembers'];
  }
}
