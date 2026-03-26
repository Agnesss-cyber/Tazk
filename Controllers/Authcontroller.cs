using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;

namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TazkDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(TazkDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // POST api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Check if email already taken
            var emailExists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return Conflict("An account with this email already exists.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return CreatedAtAction(nameof(Register), new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                CreatedAt = user.CreatedAt
            });
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                CreatedAt = user.CreatedAt
            });
        }

        //JWT Helper

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = Environment.GetEnvironmentVariable("TAZK_JWT_SECRET")
                ?? throw new InvalidOperationException("JWT secret environment variable 'TAZK_JWT_SECRET' is not set.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("fullName", user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: "Tazk",
                audience: "TazkUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}