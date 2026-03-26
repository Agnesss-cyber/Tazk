using Microsoft.AspNetCore.Mvc;
using Tazk.Models;

namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnumsController : ControllerBase
    {
        // GET api/enums/workspace-types
        [HttpGet("workspace-types")]
        public IActionResult GetWorkspaceTypes()
        {
            return Ok(GetEnumOptions<WorkspaceType>());
        }

        // GET api/enums/member-roles
        [HttpGet("member-roles")]
        public IActionResult GetMemberRoles()
        {
            return Ok(GetEnumOptions<MemberRole>());
        }

        // GET api/enums/invitation-statuses
        [HttpGet("invitation-statuses")]
        public IActionResult GetInvitationStatuses()
        {
            return Ok(GetEnumOptions<InvitationStatus>());
        }

        // GET api/enums/effort-levels
        [HttpGet("effort-levels")]
        public IActionResult GetEffortLevels()
        {
            return Ok(GetEnumOptions<EffortLevel>());
        }

        // GET api/enums/urgency-levels
        [HttpGet("urgency-levels")]
        public IActionResult GetUrgencyLevels()
        {
            return Ok(GetEnumOptions<UrgencyLevel>());
        }

        // GET api/enums/completion-statuses
        [HttpGet("completion-statuses")]
        public IActionResult GetCompletionStatuses()
        {
            return Ok(GetEnumOptions<CompletionStatus>());
        }

        // GET api/enums/file-types
        [HttpGet("file-types")]
        public IActionResult GetFileTypes()
        {
            return Ok(GetEnumOptions<FileType>());
        }

        // GET api/enums/all  — convenience endpoint, returns everything at once
        [HttpGet("all")]
        public IActionResult GetAll()
        {
            return Ok(new
            {
                workspaceTypes = GetEnumOptions<WorkspaceType>(),
                memberRoles = GetEnumOptions<MemberRole>(),
                invitationStatuses = GetEnumOptions<InvitationStatus>(),
                effortLevels = GetEnumOptions<EffortLevel>(),
                urgencyLevels = GetEnumOptions<UrgencyLevel>(),
                completionStatuses = GetEnumOptions<CompletionStatus>(),
                fileTypes = GetEnumOptions<FileType>()
            });
        }

        //  Helper 
        // Returns a list of { value, label } objects for any enum type
        private static IEnumerable<object> GetEnumOptions<TEnum>() where TEnum : Enum
        {
            return Enum.GetValues(typeof(TEnum))
                .Cast<TEnum>()
                .Select(e => new
                {
                    value = Convert.ToInt32(e),   // what gets stored in DB / sent in POST body
                    label = e.ToString()           // what gets displayed in the UI
                });
        }
    }
}