  ############################# Server Basics #############################

  # The role of this server. Setting this puts us in KRaft mode.
  process.roles=controller

  # The node id associated with this instance's roles.
  node.id=1

  # The connect string for the controller quorum.
  controller.quorum.voters=1@controller1.example.com:9093,2@controller2.example.com:9093,3@controller3.example.com:9093

 ############################# Socket Server Settings #############################

 # The address the socket server listens on.
 # Note that only the controller listeners are allowed here when `process.roles=controller`, and this listener should be consistent with `controller.quorum.voters` value.
 #   FORMAT:
 #     listeners = listener_name://host_name:port
 #   EXAMPLE:
 #     listeners = PLAINTEXT://your.host.name:9092
 listeners=CONTROLLER://controller1.example.com:9093

 # A comma-separated list of the names of the listeners used by the controller.
 # This is required if running in KRaft mode.
 controller.listener.names=CONTROLLER

 # How to communicate with brokers.
 inter.broker.listener.name=BROKER

 # Maps listener names to security protocols, the default is for them to be the same.
 listener.security.protocol.map=CONTROLLER:SSL,BROKER:SSL

 ############################# Log Basics #############################

 # A comma separated list of directories under which to store log files
 log.dirs=/tmp/kraft-controller-logs


# ... # Additional property settings to match broker settings.