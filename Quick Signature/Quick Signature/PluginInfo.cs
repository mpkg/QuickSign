using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UNIZAP.Addon.QuickSign.Constants
{
    public static class PluginInfo
    {
        public const string MessageCreate = "Create";
        public const string MessageUpdate = "Update";
        public const string MessageDelete = "Delete";
        public const string MessageSetState = "SetState";
        public const string MessageSetStateDynamic = "SetStateDynamicEntity";
        public const string MessageWin = "Win";

        public enum StageValues
        {
            PreValidation = 10
            ,PreOperation = 20
            ,PostOperation = 40
        }

        public enum ModeValue
        {
            Synchronous = 0,
            Asynchronous = 1
        }
    }
}
