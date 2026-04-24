import 'package:flutter/material.dart';
import 'package:tazk/Pages/login.dart';
import 'package:tazk/Pages/signup.dart';
// Update this import to match your actual file structure
import '/colors.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'TAZK',
          style: TextStyle(
            color: AppColors.darkGray,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
      body: Column(
        children: [
          // Main Hero Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Manage projects without the chaos.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      color: AppColors.darkGray,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Tazk helps you organize tasks, track progress, and collaborate effortlessly so nothing falls through the cracks',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: AppColors.slateBlue),
                  ),
                  const SizedBox(height: 40),

                  // Buttons Section
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => SignUpPage(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.slateBlue,
                            foregroundColor: AppColors.offWhite,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => LoginPage(),
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.darkGray,
                            side: const BorderSide(color: AppColors.lightGray),
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Login',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Footer Section
          Container(
            padding: const EdgeInsets.all(24),
            color: AppColors.darkGray,
            width: double.infinity,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CONTACT',
                  style: TextStyle(
                    color: AppColors.lightGray,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'support@tazk.io',
                  style: TextStyle(color: AppColors.offWhite),
                ),
                Text(
                  '+1 (800) 555-TAZK',
                  style: TextStyle(color: AppColors.offWhite),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
