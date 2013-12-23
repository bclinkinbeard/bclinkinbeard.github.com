
package @namespace@.@commands@
{
	import com.adobe.cairngorm.commands.ICommand;
	import com.adobe.cairngorm.control.CairngormEvent;
	import @namespace@.@business@.@delegate@;
	import @namespace@.@events@.@sequence@Event;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.IResponder;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	
	public class @sequence@Command implements ICommand, IResponder
	{
		public function execute(event:CairngormEvent):void
		{
			var evt:@sequence@Event = event as @sequence@Event;
			var delegate:@delegate@ = new @delegate@( this );
		}
		
		public function result(data:Object):void
		{
			var result:ResultEvent = data as ResultEvent;
		}
		
		public function fault(info:Object):void
		{
			var fault:FaultEvent = info as FaultEvent;
		}
	}
}