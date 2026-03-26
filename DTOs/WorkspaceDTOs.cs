namespace Tazk.DTOs
{
    //  Workspace 

    public class CreateWorkspaceDto
    {
        public required string Name { get; set; }
        public int OwnerId { get; set; }
        public Tazk.Models.WorkspaceType Type { get; set; }
    }

    public class UpdateWorkspaceDto
    {
        public string? Name { get; set; }
        public Tazk.Models.WorkspaceType? Type { get; set; }
    }

    // Workspace Invitation 

    public class CreateInvitationDto
    {
        public required string Email { get; set; }
        public int WorkspaceId { get; set; }
    }

    public class UpdateInvitationStatusDto
    {
        public Tazk.Models.InvitationStatus Status { get; set; }
    }

    // Workspace Member 

    public class UpdateMemberRoleDto
    {
        public Tazk.Models.MemberRole Role { get; set; }
    }
}