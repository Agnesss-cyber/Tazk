namespace Tazk.Models
{
    public enum WorkspaceType
    {
        Private,
        Public
    }

    public enum MemberRole
    {
        Member,
        Manager
    }

    public enum InvitationStatus
    {
        Pending,
        Accepted,
        Declined
    }

    public enum EffortLevel
    {
        Low,
        Medium,
        High
    }

    public enum UrgencyLevel
    {
        Low,
        Medium,
        High
    }

    public enum CompletionStatus
    {
        OnTime,
        Early,
        Late
    }

    public enum FileType
    {
        Pdf,
        Docx,
        Other
    }
}