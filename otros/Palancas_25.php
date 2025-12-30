<?php

	require "../config/conexion.php";

Class Palanca
{

	//Implementa constructor
	public function __construct()
	{

	}

	public function listarPoligonos_exceso($rut_conductor,$flag,$id_base_recibido,$fecha){

		
			switch ($flag) {
				case '10':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 AND (t.exceso - t.permitido)<20)";
					break;
				
				case '20':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 20)";
					break;
				case 'fundo':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 )  AND  t.areano LIKE 'CNVEL%'";
					break;	
			}



		$sql="SELECT t.*, CONCAT(t.equipo_velocidad , '  - ' , t.patente_velocidad ) as camion, e.sigla_equipo,
			UPPER(CONCAT(co.apellidoPat_conductor,' ',co.apellidoMat_conductor,' ',SUBSTRING_INDEX(co.nombre_conductor, ' ', 1))) as nombreConductor,tt.areano,tt.areaname,cg.coordenadas,'RUTA/VEL' AS geocerca, cg.nombre_geocerca,cg.es_prohibida
				FROM trip_velocidad t
                     			INNER JOIN conductor co ON co.rut_conductor=t.rut_conductor
								INNER JOIN equipo e ON e.patente_equipo=t.patente_velocidad
                                INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato=e.id_equipo_contrato
                                INNER JOIN contrato c ON c.id_contrato=eq.id_contrato
                                INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca
                                LEFT JOIN coordenada_geocerca cg ON cg.areaNo = tt.areano
								WHERE t.fuente = 'TT' AND t.fecha = '$fecha' 
								 AND (
 			   							CASE
 			   							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
               							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
               							    WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			   							  ELSE  TRUE
 			   							END
 									 )AND t.estado = 0 AND t.id_conductor IS NOT NULL AND co.rut_conductor='$rut_conductor'
		 								$sql_flag";

	//	echo $sql;
		return ejecutarConsulta($sql);
	}

	public function listarWebfleetOdometro($fecha,$sigla_equipo){

		$sql="SELECT o.odometro as odometroHistorial,o.*,e.*, em.nombre_empresa,b.nombre_base,c.nombre_contrato FROM odometro_historial o

				INNER JOIN equipo e ON e.id_equipo = o.id_equipo
				INNER JOIN equipo_contrato ec ON ec.id_equipo = e.id_equipo 
				INNER JOIN contrato c ON c.id_contrato = ec.id_contrato
				INNER JOIN base b ON b.id_base = c.id_base 
				INNER JOIN estado_equipo ee ON ee.id_estado_equipo=e.id_estado_equipo
				INNER JOIN empresa em ON em.id_empresa=c.id_empresa

				WHERE  e.sigla_equipo='$sigla_equipo'
				 AND  ('$fecha' BETWEEN ec.fecha_ini AND IFNULL(ec.fecha_fin,NOW())) 
				 
				ORDER BY o.id_odometro DESC
				LIMIT 1000";


	//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function listarOdometros($fecha,$id_base){

		$sql_base= ($id_base==0)? "": "AND b.id_base='$id_base'";

		
		$sql="SELECT e.*,v.*,w.* FROM 

					(
						SELECT 			
							e.id_equipo,
							e.sigla_equipo,
							e.centroCosto_equipo,
							e.patente_equipo ,
    						e.numChasis_equipo,
							c.nombre_contrato,
							 b.nombre_base,
							 e.id_estado_equipo,
								ec.fecha_ini,
								 ec.fecha_fin,
								 ec.estado,
								 b.id_base,
								 ee.nombre_estado_equipo,
								 em.nombre_empresa
    								
						FROM equipo e 
						INNER JOIN equipo_contrato ec ON ec.id_equipo = e.id_equipo 
						INNER JOIN contrato c ON c.id_contrato = ec.id_contrato
						INNER JOIN base b ON b.id_base = c.id_base 
						INNER JOIN estado_equipo ee ON ee.id_estado_equipo=e.id_estado_equipo
						INNER JOIN empresa em ON em.id_empresa=c.id_empresa
						WHERE ('$fecha' BETWEEN ec.fecha_ini AND IFNULL(ec.fecha_fin,NOW())) 
						GROUP BY e.id_equipo
				) e 
                
                
                LEFT JOIN (
                	SELECT 
       					 vs1.Vin , vs1.CreatedDateTime,vs1.CreatedDateTimeChile,vs1.HRTotalVehicleDistance
   					 		FROM vehicle_status vs1
    						INNER JOIN (
        					SELECT Vin, MAX(CreatedDateTime) AS max_fecha
        					FROM vehicle_status
        					GROUP BY Vin
   					 ) vs2 ON vs1.Vin = vs2.Vin AND vs1.CreatedDateTime = vs2.max_fecha
                
                
                )v ON v.Vin = e.numChasis_equipo
				
                LEFT JOIN (
                
                SELECT 
        oh1.id_equipo,
        oh1.odometro as odometro_webf,
        oh1.fecha_hora as fecha_hora_webfleet
    FROM odometro_historial oh1
    INNER JOIN (
        SELECT o.id_equipo, MAX(o.fecha_hora) AS max_fecha
        FROM odometro_historial o
        WHERE o.fecha_hora >= DATE_SUB('$fecha', INTERVAL 2 DAY)
        GROUP BY o.id_equipo
    ) oh2 ON oh1.id_equipo = oh2.id_equipo AND oh1.fecha_hora = oh2.max_fecha
    
    GROUP BY oh1.id_equipo
                
                )w ON w.id_equipo = e.id_equipo";

		//echo $sql;
		return ejecutarConsulta($sql);
	}

		public function listarVehicleStatusId($vin){

			$sql="WITH e_volvo AS (SELECT b.nombre_base,vv.sigla_equipo,v.* FROM vehicle_status v 

					INNER JOIN vehicles_volvo vv ON vv.vin =v.Vin
				    INNER JOIN equipo e ON e.sigla_equipo=vv.sigla_equipo
				     LEFT JOIN equipo_contrato ec ON ec.id_equipo = e.id_equipo AND ec.estado = 0 
					 LEFT JOIN contrato c ON c.id_contrato = ec.id_contrato
				     LEFT JOIN base b ON b.id_base = c.id_base) 


				 SELECT * FROM    e_volvo e 

				WHERE e.vin='$vin'";

		//echo $sql;
		return ejecutarConsulta($sql);

	}

		public function panelEquipo($id_base){
		$sql_base = ($id_base == 0) ? '' : " AND b.id_base = '$id_base'" ;
		
		$sql="SELECT e.*,v.* FROM vehicles_volvo v 

	  			INNER JOIN equipo e ON e.sigla_equipo=v.sigla_equipo
				INNER JOIN equipo_contrato ec ON ec.id_equipo = e.id_equipo AND ec.estado = 0 
				INNER JOIN contrato c ON c.id_contrato = ec.id_contrato
				INNER JOIN programa p ON p.id_equipo = e.id_equipo
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				INNER JOIN base b ON b.id_base = c.id_base $sql_base
				 WHERE ep.op_estado_programa='OP'
				ORDER BY e.sigla_equipo DESC";



		return ejecutarConsulta($sql);
	}

// horarioFin_programa - horarioAsignacion_programa

	
	public function listarPosicionVehiculoMap($id_base,$fecha){
		$sql_base = ($id_base == 0) ? '' : " AND b.id_base = '$id_base'" ;

		$sql="SELECT r.origen_ruta, r.destino_ruta,es.nombre_estado_equipo,e.sigla_equipo,v2.* FROM (
								SELECT MAX(v.id_position)as ultimoR FROM vehicle_position v 
								GROUP BY v.vin 
							) v

				INNER JOIN vehicle_position v2 ON v2.id_position=v.ultimoR
				INNER JOIN vehicles_volvo vv ON vv.vin=v2.vin
			    INNER JOIN equipo e ON e.sigla_equipo=vv.sigla_equipo
				INNER JOIN programa p ON p.id_equipo = e.id_equipo
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				INNER JOIN equipo_contrato ec ON ec.id_equipo = e.id_equipo AND ec.estado = 0 
				INNER JOIN contrato c ON c.id_contrato = ec.id_contrato
				INNER JOIN base b ON b.id_base = c.id_base $sql_base
                INNER JOIN estado_equipo es ON es.id_estado_equipo= e.id_estado_equipo
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE ep.op_estado_programa='OP'    AND p.fechaTurno_programa = '$fecha'
                  ";

		return ejecutarConsulta($sql);
	}

	public function poligonoOrigenDestinoConductor($fecha,$id_conductor){

		$sql="SELECT t.coordenadas,t.areaname,'origen' as tipo,r.* FROM programa p 

				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
                LEFT JOIN tomtom_geocerca t ON t.areauid = r.geocerca_origen
               

	 WHERE p.fechaTurno_programa BETWEEN DATE_SUB('$fecha', INTERVAL 1 DAY) AND '$fecha' AND p.id_conductor='$id_conductor'
     
     UNION all 

SELECT DISTINCT t.coordenadas,t.areaname,'destino' as tipo,r.* FROM programa p 

				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
                LEFT JOIN tomtom_geocerca t ON t.areauid = r.geocerca_destino
               

	 WHERE p.fechaTurno_programa BETWEEN DATE_SUB('$fecha', INTERVAL 1 DAY) AND '$fecha' AND p.id_conductor='$id_conductor'";

//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function listarPoligonosOrigenDestino($id_base,$fecha){

		$sql="SELECT DISTINCT r.id_ruta, r.origen_ruta, '' as destino_ruta, t.coordenadas as coordenadas , 'origen' as tipo
		
				  FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
                LEFT JOIN tomtom_geocerca t ON t.areauid = r.geocerca_origen
              
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE ep.op_estado_programa='OP' AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha'  AND t.active='1'


UNION ALL

SELECT DISTINCT r.id_ruta, '' as origen_ruta, r.destino_ruta, t.coordenadas as coordenadas , 'destino' as tipo
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
                LEFT JOIN tomtom_geocerca t ON t.areauid = r.geocerca_destino
              
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE ep.op_estado_programa='OP' AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' AND t.active='1'";


		return ejecutarConsulta($sql);
	}

		public function listarPoligonos($id_base){

	

		$arauco = array(10,20);
		$mininco = array(1,2,3,22,23);
		$extras= array(1,2,3,22,23,20,10);
		$sql_fuente = (in_array($id_base,$mininco)) ? "WHERE co.fuente='MININCO'" : $sql_fuente = (in_array($id_base,$arauco)) ? "WHERE co.fuente='ARAUCO' ": " " ; ;

		$sql="		SELECT
					 'RUTA/VEL' as geocerca, co.id_coordenada,co.areaNo,co.nombre_geocerca,co.coordenadas,co.fuente,co.limite_velocidad,co.es_prohibida
					  FROM coordenada_geocerca co $sql_fuente
					UNION

					SELECT 'PREDIO' as gecerca, c.id_predio as id_coordenada ,c.areano,c.areaname as nombre_geocerca,c.coordenadas,
							t.orides as fuente ,'predio' as limite_velocidad,'predio' as es_prohibida
							  FROM coordenada_predio_v2 c
									INNER JOIN tomtom_geocerca t ON t.areauid = c.areauid
									WHERE t.orides<>''

					UNION 

					SELECT 'BASE' as geocerca, b.id_coordenada,'BASE' as areano,b.nombre_base as nombre_geocerca,b.coordenadas,'BASE' as fuente,'BASE' as limite_velocidad,'BASE' as es_prohibida   FROM coordenada_base b
					
			";

//echo $sql;
		return ejecutarConsulta($sql);
	}


	public function panelBase()
    {
      	$sql = "SELECT b.id_base_central, UPPER(b.nombre_base_central) as nombre_base_central 
      			FROM base_central b 
	  		  	WHERE b.estado_base_central = '1'";
  
      	return ejecutarConsulta($sql);
    }

	public function girosTotalesTE($fecha,$id_base){


		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 

			
				       INNER JOIn contrato co 	ON p.id_contrato = co.id_contrato
				       INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                       INNER JOIN base b ON b.id_base = p.id_base
					   INNER JOIN equipo e ON e.id_equipo = p.id_equipo
					   INNER JOIN conductor c ON c.id_conductor = p.id_conductor
					   LEFT JOIN guia g ON g.id_programa = p.id_programa
					   LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
                       LEFT JOIN producto pr ON pr.id_producto = p.id_producto
						LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
						
				        WHERE  ep.op_estado_programa IN ('OP','FIN') 
						AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha'
			
				 ";

//echo $sql;
		return ejecutarConsulta($sql);
	}
	public function girosTotalesEjecucionFin($fecha,$id_base,$flag){


		$sql_estado = ($flag == 'EJECUCION') ? "ep.op_estado_programa='OP'" : "ep.op_estado_programa='FIN'";

		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE $sql_estado AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' ";

//echo $sql;
		return ejecutarConsulta($sql);
	}


	
	public function listarVehiclePositionByVin($vin,$fecha_ini,$fecha_fin){

		$sql="SELECT v.* FROM vehicle_position v 

			WHERE v.vin='$vin' AND v.fecha_creacion_local BETWEEN '$fecha_ini' AND '$fecha_fin'
    
    		ORDER BY v.fecha_creacion_local ASC";

			//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function odometroLibreta($fecha){

		$sql="SELECT	b.nombre_base,e.sigla_equipo,
					  UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, 
			  	TIMEDIFF(l.libreta_fecha_fin, l.libreta_fecha_inicio) AS diferencia_hms,
					 l.*,(v.HRTotalVehicleDistance/1000) as ODO_INI,v.CreatedDateTimeChile AS fecha_odo_ini,l.fecha_ini_libreta as FECHA_INI,(v2.HRTotalVehicleDistance/1000) as ODO_FIN ,v2.CreatedDateTimeChile as fecha_odo_fin,l.libreta_fecha_fin as FECHA_FIN,
					  ((v2.HRTotalVehicleDistance-v.HRTotalVehicleDistance)/1000) as Distancia_giro
					   FROM libreta_jornada_detalle l

			INNER JOIN conductor c ON c.id_conductor = l.libreta_id_conductor
			INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
			INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
			INNER JOIN base b ON b.id_base = co.id_base
			INNER JOIN equipo e ON e.id_equipo = l.libreta_id_equipo
			LEFT JOIN vehicle_status v ON v.id_vehicle_status = (
						    SELECT vs.id_vehicle_status 
						    FROM vehicle_status vs 
						    WHERE vs.Vin = e.numChasis_equipo 
						    AND vs.CreatedDateTimeChile BETWEEN  l.libreta_fecha_inicio AND  l.libreta_fecha_fin 
						    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs.CreatedDateTimeChile, l.libreta_fecha_inicio)) 
						    LIMIT 1
						)

				LEFT JOIN vehicle_status v2 ON v2.id_vehicle_status = (
						    SELECT vs2.id_vehicle_status 
						    FROM vehicle_status vs2 
						    WHERE vs2.Vin = e.numChasis_equipo 
						    AND vs2.CreatedDateTimeChile BETWEEN l.libreta_fecha_inicio AND  l.libreta_fecha_fin

						    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs2.CreatedDateTimeChile, l.libreta_fecha_fin)) 
						    LIMIT 1
						)


			WHERE l.libreta_fecha_inicio >= '$fecha' AND l.libreta_tarea='Tiempo de Espera'";

//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function panelContratoBase($id_base){

		$sql="SELECT c.id_contrato,c.nombre_contrato FROM contrato c

		INNER JOIN base b ON b.id_base = c.id_base
    	WHERE b.id_base = '$id_base' and c.mantencion_contrato = 0 AND c.delete_contrato=0 ";

		return ejecutarConsulta($sql);
	}


	  public function panelBaseEquipo()
    {
      $sql = "SELECT UPPER(b.nombre_base)as nombre,b.id_base FROM base b WHERE b.estado_base=1 AND b.id_base<>15 ORDER BY b.nombre_base ASC";
  

      return ejecutarConsulta($sql);
    }
	public function odometroLibretaV2($fecha_ini,$fecha_fin,$id_contrato,$id_base,$flag){

		$sql_flag = ($flag == '')? "":"AND ((v2.HRTotalVehicleDistance-v.HRTotalVehicleDistance)/1000) >='$flag'";
		$sql_id_base = ($id_base==0)? "" : "AND b.id_base='$id_base'";	
		$sql_contrato = ($id_contrato==0)? "" : "AND co.id_contrato='$id_contrato'";
		$sql="SELECT	b.nombre_base,e.sigla_equipo,co.nombre_contrato,c.id_conductor,
					  UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, 
			  	TIMEDIFF(l.libreta_fecha_fin, l.libreta_fecha_inicio) AS diferencia_hms,
					 l.*,(v.HRTotalVehicleDistance/1000) as ODO_INI,v.CreatedDateTimeChile AS fecha_odo_ini,l.fecha_ini_libreta as FECHA_INI,(v2.HRTotalVehicleDistance/1000) as ODO_FIN ,v2.CreatedDateTimeChile as fecha_odo_fin,l.libreta_fecha_fin as FECHA_FIN,
					  ((v2.HRTotalVehicleDistance-v.HRTotalVehicleDistance)/1000) as Distancia_giro,v.Vin
					   FROM libreta_jornada_detalle l

			INNER JOIN conductor c ON c.id_conductor = l.libreta_id_conductor
			INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
			INNER JOIN contrato co ON co.id_contrato = cc.id_contrato 
			INNER JOIN base b ON b.id_base = co.id_base $sql_id_base
			INNER JOIN equipo e ON e.id_equipo = l.libreta_id_equipo
			LEFT JOIN vehicle_status v ON v.id_vehicle_status = (
						    SELECT vs.id_vehicle_status 
						    FROM vehicle_status vs 
						    WHERE vs.Vin = e.numChasis_equipo 
						    AND vs.CreatedDateTimeChile BETWEEN  l.libreta_fecha_inicio AND  l.libreta_fecha_fin 
						    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs.CreatedDateTimeChile, l.libreta_fecha_inicio)) 
						    LIMIT 1
						)

				LEFT JOIN vehicle_status v2 ON v2.id_vehicle_status = (
						    SELECT vs2.id_vehicle_status 
						    FROM vehicle_status vs2 
						    WHERE vs2.Vin = e.numChasis_equipo 
						    AND vs2.CreatedDateTimeChile BETWEEN l.libreta_fecha_inicio AND  l.libreta_fecha_fin

						    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs2.CreatedDateTimeChile, l.libreta_fecha_fin)) 
						    LIMIT 1
						)


			WHERE l.libreta_fecha_inicio BETWEEN '$fecha_ini 00:00:00' AND '$fecha_fin 23:59:59' AND l.libreta_tarea='Tiempo de Espera' $sql_flag";


	//echo $sql;
		return ejecutarConsulta($sql);
$sql_prog="SELECT 
    b.nombre_base,
    e.sigla_equipo,
    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, 
    TIMEDIFF(l.libreta_fecha_fin, l.libreta_fecha_inicio) AS diferencia_hms,
    l.*,
    (v.HRTotalVehicleDistance/1000) as ODO_INI,
    v.CreatedDateTimeChile AS fecha_odo_ini,
    l.fecha_ini_libreta as FECHA_INI,
    (v2.HRTotalVehicleDistance/1000) as ODO_FIN,
    v2.CreatedDateTimeChile as fecha_odo_fin,
    l.libreta_fecha_fin as FECHA_FIN,
    ((v2.HRTotalVehicleDistance-v.HRTotalVehicleDistance)/1000) as Distancia_giro,
    v.Vin,
    p.id_programa
FROM libreta_jornada_detalle l
INNER JOIN conductor c ON c.id_conductor = l.libreta_id_conductor
INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor 
    AND cc.estado = 0 
    AND c.estado_buk = 'activo'
INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
INNER JOIN base b ON b.id_base = co.id_base
INNER JOIN equipo e ON e.id_equipo = l.libreta_id_equipo
LEFT JOIN vehicle_status v ON v.id_vehicle_status = (
    SELECT vs.id_vehicle_status 
    FROM vehicle_status vs 
    WHERE vs.Vin = e.numChasis_equipo 
        AND vs.CreatedDateTimeChile BETWEEN l.libreta_fecha_inicio AND l.libreta_fecha_fin
    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs.CreatedDateTimeChile, l.libreta_fecha_inicio))
    LIMIT 1
)
LEFT JOIN vehicle_status v2 ON v2.id_vehicle_status = (
    SELECT vs2.id_vehicle_status 
    FROM vehicle_status vs2 
    WHERE vs2.Vin = e.numChasis_equipo 
        AND vs2.CreatedDateTimeChile BETWEEN l.libreta_fecha_inicio AND l.libreta_fecha_fin
    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs2.CreatedDateTimeChile, l.libreta_fecha_fin))
    LIMIT 1
)
LEFT JOIN programa p ON p.id_programa = (
    SELECT p2.id_programa
    FROM programa p2
    INNER JOIN estado_programa ep ON ep.id_estado_programa = p2.id_estado_programa
    WHERE p2.patente_programa = l.libreta_patente_movil
        AND p2.fechaTurno_programa = '2025-12-04'
        AND ep.abrev_estado_programa = 'FIN'
        AND l.libreta_fecha_inicio BETWEEN p2.horarioAsignacion_programa AND p2.horarioFin_programa
    ORDER BY ABS(TIMESTAMPDIFF(SECOND, p2.horarioAsignacion_programa, l.libreta_fecha_inicio))
    LIMIT 1
)
WHERE l.libreta_fecha_inicio BETWEEN '2025-12-04 00:00:00' AND '2025-12-04 23:59:59' 
    AND l.libreta_tarea = 'Tiempo de Espera'";
	}

	public function odometroPrograma($fecha,$id_base){


		$sql="SELECT b.nombre_base,
			    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, 
			    p.*,
				e.*,
			
			       (v.HRTotalVehicleDistance/1000) as ODOMETRO_INI,
			    v.CreatedDateTimeChile as Fecha_odometro_ini,
			    p.horarioAsignacion_programa as fecha_ini,
			    (v2.HRTotalVehicleDistance/1000) as ODOMETRO_FIN,
			    v2.CreatedDateTimeChile as Fecha_odometro_fin,
			    p.horarioSalDestino_programa as fecha_fin,
			    ((v2.HRTotalVehicleDistance-v.HRTotalVehicleDistance)/1000) as Distancia_giro,
				  ((r.kmRipio_ruta+r.kmPav_ruta)*2) as km_ruta,
                (r.kmRipio_ruta*2) as kmRipio_ruta ,(r.kmPav_ruta*2) as kmPav_ruta
			FROM programa p 
			INNER JOIN equipo e ON e.id_equipo = p.id_equipo
			LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
			LEFT JOIN guia g ON g.id_programa = p.id_programa
			LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
			LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
			LEFT JOIN producto pr ON pr.id_producto = p.id_producto
			LEFT JOIN vehicle_status v ON v.id_vehicle_status = (
			    SELECT vs.id_vehicle_status 
			    FROM vehicle_status vs 
			    WHERE vs.Vin = e.numChasis_equipo 
			    AND vs.CreatedDateTimeChile BETWEEN DATE_SUB(p.horarioAsignacion_programa , INTERVAL 1 HOUR) 
			                                  AND DATE_ADD(p.horarioAsignacion_programa, INTERVAL 1 HOUR)
			    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs.CreatedDateTimeChile, p.horarioAsignacion_programa)) 
			    LIMIT 1
			)
			LEFT JOIN vehicle_status v2 ON v2.id_vehicle_status = (
			    SELECT vs2.id_vehicle_status 
			    FROM vehicle_status vs2 
			    WHERE vs2.Vin = e.numChasis_equipo 
			    AND vs2.CreatedDateTimeChile BETWEEN DATE_SUB(p.horarioSalDestino_programa, INTERVAL 1 HOUR) 
			                                   AND DATE_ADD(p.horarioSalDestino_programa, INTERVAL 1 HOUR)
			    ORDER BY ABS(TIMESTAMPDIFF(SECOND, vs2.CreatedDateTimeChile, p.horarioSalDestino_programa)) 
			    LIMIT 1
			)
			INNER JOIN base b ON b.id_base = p.id_base
			INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
			WHERE ep.op_estado_programa='FIN' 
			    # AND p.id_base = '$id_base'   
			    AND p.fechaTurno_programa = '$fecha'";

//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function girosAdicionales($fecha,$id_base){


		$sql="SELECT ep.*,e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				LEFT JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE p.viajeExtra_programa=1 AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' ";


		return ejecutarConsulta($sql);
	}
	public function listarDetalleGiroSuspendido($fecha,$id_base,$flag){


		$sql_suspendido = ($flag == 'INTERNO') ? "AND j.respon_justificacion='INT'" : "AND j.respon_justificacion='EXT'";

		$sql="SELECT e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso, s.observaciones_suspender,j.respon_justificacion,j.nombre_justificacion,j.color_justificacion
				FROM programa p 
				LEFT JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				INNER JOIN suspender s ON s.id_programa = p.id_programa
				INNER JOIN justificacion j ON j.id_justificacion = s.id_justificacion
				WHERE p.id_estado_programa = 7 $sql_suspendido AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' ";


		//echo $sql;
		return ejecutarConsulta($sql);
	}
	public function girosTotalesPrograma($fecha,$id_base){


		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				LEFT JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				INNER JOIN base b ON b.id_base = p.id_base
				WHERE   p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' ";



		return ejecutarConsulta($sql);
	}

	public function verGirosEquipo( $fecha, $id_equipo,$turno){
		
		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				LEFT JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				INNER JOIN jornada_regimen j ON j.id_jornada_regimen = p.id_jornada_regimen AND j.nombre_jornada_regimen='$turno'
				WHERE ep.op_estado_programa IN ('OP', 'FIN')     AND p.fechaTurno_programa = '$fecha' AND p.id_equipo='$id_equipo'
                
                
                GROUP BY p.id_programa";


		return ejecutarConsulta($sql);

	}

	public function listarGruasGiroFinSP( $fecha, $id_base,$flag){


		$sql_bajo_p = ($flag == "bajoPeso")? " AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000 AND g.peso_guia > 46000" : "";
		$sql_join = ($flag == "sobrePeso")? " INNER JOIN" : "LEFT JOIN";

		$sql="SELECT 		p.grua_programa,
							COUNT(p.id_programa)as giros,
							b.girosSP
							FROM programa p 

							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
							 INNER JOIN guia g ON g.id_programa = p.id_programa
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                     $sql_join(
                            
                            		SELECT p.grua_programa,
                                COUNT(p.id_programa) as girosSP
                            	FROM programa p 
							INNER JOIN guia g ON g.id_programa = p.id_programa
							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            	WHERE p.fechaTurno_programa='$fecha'  AND ep.op_estado_programa  = 'FIN' 
                        AND b.id_base='$id_base' AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000 AND g.peso_guia >46000
                        			
                                GROUP BY p.grua_programa
                    		)b ON b.grua_programa = p.grua_programa
                            
                            	WHERE p.fechaTurno_programa='$fecha'  AND ep.op_estado_programa  = 'FIN' 
                        AND b.id_base='$id_base'
                        GROUP BY p.grua_programa";

//echo $sql;

		return ejecutarConsulta($sql);
	}
	public function listarGruasGiroFin( $fecha, $id_base,$flag){


		$sql_bajo_p = ($flag == "bajoPeso")? " AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000 AND g.peso_guia < b.bajo_peso" : "";
		$sql_join = ($flag == "bajoPeso")? " INNER JOIN" : "LEFT JOIN";

		$sql="SELECT 		p.grua_programa,
							COUNT(p.id_programa)as giros,
							b.girosBP
							FROM programa p 

							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
							 INNER JOIN guia g ON g.id_programa = p.id_programa
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                     $sql_join(
                            
                            		SELECT p.grua_programa,
                                COUNT(p.id_programa) as girosBP
                            	FROM programa p 
							INNER JOIN guia g ON g.id_programa = p.id_programa
							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            	WHERE p.fechaTurno_programa='$fecha'  AND ep.op_estado_programa  = 'FIN' 
                        AND b.id_base='$id_base' AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000 AND g.peso_guia < b.bajo_peso
                        			
                                GROUP BY p.grua_programa
                    		)b ON b.grua_programa = p.grua_programa
                            
                            	WHERE p.fechaTurno_programa='$fecha'  AND ep.op_estado_programa  = 'FIN' 
                        AND b.id_base='$id_base'
                        GROUP BY p.grua_programa";

//echo $sql;

		return ejecutarConsulta($sql);
	}
	public function girosTotales($fecha,$id_base,$grua,$flag){

		$sql_grua = ($grua == "")? "": "AND p.grua_programa='$grua'";

		$sql_bajo_P = ($flag == "bajoPeso") ? "AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000 AND g.peso_guia < b.bajo_peso ": "";

		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				INNER JOIN conductor c ON c.id_conductor = p.id_conductor
				INNER JOIN guia g ON g.id_programa = p.id_programa
				INNER JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				INNER JOIN ruta r ON r.id_ruta = p.id_ruta
				INNER JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE p.id_estado_programa = 6 AND p.id_base = '$id_base'   AND p.fechaTurno_programa = '$fecha' $sql_grua  $sql_bajo_P";



		return ejecutarConsulta($sql);
	}


	public function verGiroConductorTE( $fecha, $id_conductor){

		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				INNER JOIN conductor c ON c.id_conductor = p.id_conductor
				LEFT JOIN guia g ON g.id_programa = p.id_programa
				LEFT JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				LEFT JOIN ruta r ON r.id_ruta = p.id_ruta
				LEFT JOIN producto pr ON pr.id_producto = p.id_producto
				LEFT JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE p.id_conductor='$id_conductor'  AND p.fechaTurno_programa = '$fecha'
                
                GROUP BY p.id_programa";

//echo $sql;

		return ejecutarConsulta($sql);
	}


	public function listarGuardianBase($fecha){

		$fecha_inicio = $fecha . ' 00:00:00';

    // 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
    // Se usa la clase DateTime (disponible desde PHP 5.2)
    $fecha_obj = new DateTime($fecha);
    $fecha_obj->modify('+1 day');
    $fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');


	// NO USO BETWEEN EN LA CONSULTA YA QUE BETWEEN CONSIDERA >= Y <= ,  ENTONCES INCLUYE EL PRIMER INSTANTE DEL DIA SIGUIENTE

		$sql="SELECT
					    b.id_base,
					    b.nombre_base,
					    IFNULL(ex.excesos_velocidad_bajo_20, 0) AS excesos_velocidad_bajo_20,                        
					    IFNULL(ex_s20.excesos_velocidad_sobre_20, 0) AS excesos_velocidad_sobre_20,
                        IFNULL(ex_f.excesos_f,0) as excesos_f,
					    IFNULL(f.distractor, 0) AS eventos_distraccion,
					    IFNULL(gua.celular, 0) AS alertas_uso_celular,
					    IFNULL(gua.sensores, 0) AS alertas_sensores_tapados
					FROM base b
					LEFT JOIN (
					    SELECT
					        c.id_base,
					        SUM(IF((t.exceso - t.permitido) >= 10 AND (t.exceso - t.permitido) < 20, 1, 0)) AS excesos_velocidad_bajo_20
					    FROM trip_velocidad t
					    INNER JOIN equipo e ON e.patente_equipo = t.patente_velocidad
					    INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato = e.id_equipo_contrato
					    INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
					    INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca
					    WHERE 
					        t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin'
						AND	 (
 			   CASE
 			     WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
                 WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
                   WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			     ELSE  TRUE
 			   END
 			 )
					        AND t.fuente = 'TT'
					        AND t.estado = 0
					        AND t.id_conductor IS NOT NULL
					    GROUP BY c.id_base
					) ex ON ex.id_base = b.id_base
     	LEFT JOIN (
					    SELECT
					        c.id_base,
					        SUM(IF((t.exceso - t.permitido) >= 20 , 1, 0)) AS excesos_velocidad_sobre_20
					    FROM trip_velocidad t
					    INNER JOIN equipo e ON e.patente_equipo = t.patente_velocidad
					    INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato = e.id_equipo_contrato
					    INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
					    INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca
					    WHERE 
					        t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin'
						AND	 (
 			   CASE
 			     WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
                 WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
                   WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			     ELSE  TRUE
 			   END
 			 )
					        AND t.fuente = 'TT'
					        AND t.estado = 0
					        AND t.id_conductor IS NOT NULL
					    GROUP BY c.id_base
					) ex_s20 ON ex_s20.id_base = b.id_base   
                    

					LEFT JOIN (
					    SELECT
					        c.id_base,
					        SUM(IF((t.exceso - t.permitido) >= 10 , 1, 0)) AS excesos_f
					    FROM trip_velocidad t
					    INNER JOIN equipo e ON e.patente_equipo = t.patente_velocidad
					    INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato = e.id_equipo_contrato
					    INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
					    INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca
					    WHERE 
					          t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin' AND  t.areano LIKE 'CNVEL%' AND t.id_conductor IS NOT NULL
						AND	 (
 			   CASE
 			     WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
                 WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
                   WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			     ELSE  TRUE
 			   END
 			 )
					        AND t.fuente = 'TT'
					        AND t.estado = 0
					        AND t.id_conductor IS NOT NULL
					    GROUP BY c.id_base
					) ex_f ON ex_f.id_base = b.id_base
			
				LEFT JOIN (    SELECT 
							        co.id_base,
							        COUNT(DISTINCT form_distractor.id_form) AS distractor
							    FROM conductor c
							    INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
							    INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
							    INNER JOIN (
							        SELECT 
							            fr_rut.id_form,
							            (IF(instr(fr_rut.respuesta,'-') > 0 AND instr(fr_rut.respuesta,'|') > 0, trim(substring(fr_rut.respuesta,(position('|' in fr_rut.respuesta)+1),11)) , '')) AS rut_extraido
							        FROM form_res fr_rut
							        INNER JOIN form f ON f.id_form = fr_rut.id_form
							        WHERE 
							            fr_rut.id_encuesta = 11 AND fr_rut.id_pregunta = 125
							            AND f.fecha >= '$fecha_inicio' AND f.fecha < '$fecha_fin'
			    ) con_rut ON con_rut.rut_extraido = c.rut_conductor
    INNER JOIN (
    			    SELECT fr.id_form
    			    FROM form_res fr
    			    WHERE fr.id_encuesta = 11 AND fr.id_pregunta = 197 AND fr.respuesta = 'Si'
 						  ) form_distractor ON form_distractor.id_form = con_rut.id_form
 							   GROUP BY co.id_base
					) f ON f.id_base = b.id_base
					LEFT JOIN (
					    SELECT
					        c.id_base,
					        SUM(IF(t.subtipo_alerta IN ('Uso del teléfono móvil', 'Uso del celular', 'Dispositivo móvil'), 1, 0)) AS celular,
					        SUM(IF(t.subtipo_alerta IN ('Sensores cubiertos', 'Sensor cubierto'), 1, 0)) AS sensores
					    FROM trip_guardian t
					    INNER JOIN conductor_contrato cc ON cc.id_conductor = t.id_conductor AND cc.estado = 0
					    INNER JOIN contrato c ON c.id_contrato = cc.id_contrato
					    WHERE 
					        t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin'
					        AND t.id_conductor IS NOT NULL
					    GROUP BY c.id_base
			  ) gua ON gua.id_base = b.id_base
					WHERE b.estado_base=1
					GROUP BY b.id_base";

//		echo $sql;

		return ejecutarConsulta($sql);
	}

	public function listarExcesos($fecha,$id_base,$flag){

			switch ($flag) {
				case '10':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 AND (t.exceso - t.permitido)<20)";
					break;
				
				case '20':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 20)";
					break;
				case 'fundo':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 )  AND  t.areano LIKE 'CNVEL%'";
					break;	
			}

		$fecha_ini = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

	$sql = "SELECT 
						 UPPER(CONCAT(co.apellidoPat_conductor,' ',co.apellidoMat_conductor,' ',SUBSTRING_INDEX(co.nombre_conductor, ' ', 1))) as nombreConductor,
							co.rut_conductor,co.id_conductor,
					
								COUNT(t.id_velocidad) as excesos
	
						FROM trip_velocidad t
                     			INNER JOIN conductor co ON co.rut_conductor=t.rut_conductor
								INNER JOIN equipo e ON e.patente_equipo=t.patente_velocidad
                                INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato=e.id_equipo_contrato
                                INNER JOIN contrato c ON c.id_contrato=eq.id_contrato
                                INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca 
								WHERE t.fuente = 'TT' AND t.fecha = '$fecha' 
								 AND (
 			   							CASE
 			   							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
               							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
               							    WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			   							  ELSE  TRUE
 			   							END
 									 )AND t.estado = 0 AND t.id_conductor IS NOT NULL AND c.id_base='$id_base'
		 								$sql_flag
										   GROUP BY co.id_conductor  ";
	//echo $sql;

		return ejecutarConsulta($sql);
	}
	public function listarExcesosConductor($fecha,$rut_conductor,$flag){


			switch ($flag) {
				case '10':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 AND (t.exceso - t.permitido)<20)";
					break;
				
				case '20':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 20)";
					break;
				case 'fundo':
					$sql_flag = "AND ((t.exceso - t.permitido)>= 10 )  AND  t.areano LIKE 'CNVEL%'";
					break;	
			}
		$fecha_ini = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

	$sql = "SELECT t.*, CONCAT(t.equipo_velocidad , '  - ' , t.patente_velocidad ) as camion,tt.latitud,tt.longitud,
			UPPER(CONCAT(co.apellidoPat_conductor,' ',co.apellidoMat_conductor,' ',SUBSTRING_INDEX(co.nombre_conductor, ' ', 1))) as nombreConductor
				FROM trip_velocidad t
                     			INNER JOIN conductor co ON co.rut_conductor=t.rut_conductor
								INNER JOIN equipo e ON e.patente_equipo=t.patente_velocidad
                                INNER JOIN equipo_contrato eq ON eq.id_equipo_contrato=e.id_equipo_contrato
                                INNER JOIN contrato c ON c.id_contrato=eq.id_contrato
                                INNER JOIN tomtom_geocerca tt ON tt.id = t.id_geocerca 
								WHERE t.fuente = 'TT' AND t.fecha = '$fecha' 
								 AND (
 			   							CASE
 			   							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (20,10) THEN t.area_id LIKE '%ARA%'
               							  WHEN t.fecha > '2025-02-28' AND c.id_base IN (1,2,3,22,23) THEN t.area_id LIKE '%MIN%' 
               							    WHEN t.fecha > '2025-02-28' AND c.id_base NOT IN (1,2,3,22,23,20,10) THEN t.area_id  NOT LIKE '%MIN%' AND t.area_id  NOT LIKE '%ARA%' AND tt.es_cliente=0         
 			   							  ELSE  TRUE
 			   							END
 									 )AND t.estado = 0 AND t.id_conductor IS NOT NULL AND co.rut_conductor='$rut_conductor'
		 								$sql_flag ";
	//echo $sql;

		return ejecutarConsulta($sql);
	}

	public function listarGuardian($id_base,$fecha,$flag){

		$fecha_inicio = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

	$sql_flag = ($flag == 'CELULAR') ? "AND t.subtipo_alerta IN ('Uso del teléfono móvil', 'Uso del celular', 'Dispositivo móvil')" : "AND t.subtipo_alerta IN ('Sensores cubiertos', 'Sensor cubierto')";
		
		$sql="SELECT
					    	COUNT(DISTINCT t.id_alerta) as eventos,
					    c.rut_conductor AS RutConductor,
						t.tipo_alerta,
					    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor, ' ', 1))) AS nombreConductor
					FROM trip_guardian t
					INNER JOIN conductor c ON c.id_conductor = t.id_conductor
					INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
					INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
					INNER JOIN base b ON b.id_base = co.id_base
					INNER JOIN equipo_contrato ec ON ec.id_contrato = co.id_contrato AND ec.estado = 0
					INNER JOIN equipo e ON e.id_equipo_contrato = ec.id_equipo_contrato
					WHERE 
					    co.id_base = '$id_base'
					    AND t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin'
					    AND t.id_conductor IS NOT NULL
					    $sql_flag

						  GROUP BY c.rut_conductor";

		//echo $sql;
		return ejecutarConsulta($sql);
	}

	public function listarGuardianConductor($rut_conductor,$fecha,$flag){

		$fecha_inicio = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

	$sql_flag = ($flag == 'CELULAR') ? "AND t.subtipo_alerta IN ('Uso del teléfono móvil', 'Uso del celular', 'Dispositivo móvil')" : "AND t.subtipo_alerta IN ('Sensores cubiertos', 'Sensor cubierto')";
		
		$sql="SELECT
					    t.fecha,
						t.fecha_alerta as fecha_hora,
					    b.nombre_base AS Base,
					    t.subtipo_alerta,
						t.tipo_alerta,
						e.patente_equipo ,
    					e.sigla_equipo ,
						t.id_alerta,
					    c.rut_conductor AS RutConductor,
					    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor, ' ', 1))) AS nombreConductor
					FROM trip_guardian t
					INNER JOIN conductor c ON c.id_conductor = t.id_conductor
					INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
					INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
					INNER JOIN base b ON b.id_base = co.id_base
					INNER JOIN equipo_contrato ec ON ec.id_contrato = co.id_contrato AND ec.estado = 0
					INNER JOIN equipo e ON e.id_equipo_contrato = ec.id_equipo_contrato
					WHERE 
					    c.rut_conductor = '$rut_conductor'
					    AND t.fecha >= '$fecha_inicio' AND t.fecha < '$fecha_fin'
					    AND t.id_conductor IS NOT NULL
					    $sql_flag

						  GROUP BY t.id_alerta
					ORDER BY 
					    t.fecha, 
					    t.subtipo_alerta";

		//echo $sql;
		return ejecutarConsulta($sql);
	}


	public function listarDistraccion($id_base,$fecha){

		$fecha_inicio = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

		$sql="SELECT
					   
					    c.rut_conductor AS RutConductor,
					    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor, ' ', 1))) AS nombreConductor,
					    COUNT(fr_distractor.respuesta) AS RespuestaDistraccion
					FROM conductor c
					INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
					INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
					INNER JOIN base b ON b.id_base = co.id_base
					INNER JOIN (
					    -- Paso 1: Obtener el ID del formulario y el RUT del conductor (Pregunta 125)
					    SELECT 
					        fr_rut.id_form,
					        fr_rut.id_res,
					        (IF(instr(fr_rut.respuesta,'-') > 0 AND instr(fr_rut.respuesta,'|') > 0, trim(substring(fr_rut.respuesta,(position('|' in fr_rut.respuesta)+1),11)) , '')) AS rut_extraido
					    FROM form_res fr_rut
					    INNER JOIN form f ON f.id_form = fr_rut.id_form
					    WHERE 
					        fr_rut.id_encuesta = 11 AND fr_rut.id_pregunta = 125
					        AND f.fecha >= '$fecha_inicio' AND f.fecha < '$fecha_fin'
					) con_rut ON con_rut.rut_extraido = c.rut_conductor
					INNER JOIN form f ON f.id_form = con_rut.id_form
					INNER JOIN (
					    -- Paso 2: Obtener la respuesta de Distracción (Pregunta 197 = 'Si')
					    SELECT fr.id_form, fr.respuesta
					    FROM form_res fr
					    WHERE fr.id_encuesta = 11 AND fr.id_pregunta = 197 AND fr.respuesta = 'Si'
					) fr_distractor ON fr_distractor.id_form = f.id_form
					WHERE
					    co.id_base = '$id_base'
						GROUP BY 	c.id_conductor";

		//echo $sql;

		return ejecutarConsulta($sql);
	}
	public function listarDistraccionConductor($rut_conductor,$fecha){

		$fecha_inicio = $fecha . ' 00:00:00';

	// 2. Calcular la fecha de fin (Fecha de inicio + 1 día)
	// Se usa la clase DateTime (disponible desde PHP 5.2)
	$fecha_obj = new DateTime($fecha);
	$fecha_obj->modify('+1 day');
	$fecha_fin = $fecha_obj->format('Y-m-d 00:00:00');

		$sql="SELECT
					    f.id_form,
					    f.fecha AS fecha_reporte,
					    b.nombre_base AS Base,
					    c.rut_conductor AS RutConductor,
					    UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor, ' ', 1))) AS nombreConductor,
					    fr_distractor.respuesta AS RespuestaDistraccion
					FROM conductor c
					INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND cc.estado = 0 AND c.estado_buk = 'activo'
					INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
					INNER JOIN base b ON b.id_base = co.id_base
					INNER JOIN (
					    -- Paso 1: Obtener el ID del formulario y el RUT del conductor (Pregunta 125)
					    SELECT 
					        fr_rut.id_form,
					        fr_rut.id_res,
					        (IF(instr(fr_rut.respuesta,'-') > 0 AND instr(fr_rut.respuesta,'|') > 0, trim(substring(fr_rut.respuesta,(position('|' in fr_rut.respuesta)+1),11)) , '')) AS rut_extraido
					    FROM form_res fr_rut
					    INNER JOIN form f ON f.id_form = fr_rut.id_form
					    WHERE 
					        fr_rut.id_encuesta = 11 AND fr_rut.id_pregunta = 125
					        AND f.fecha >= '$fecha_inicio' AND f.fecha < '$fecha_fin'
					) con_rut ON con_rut.rut_extraido = c.rut_conductor
					INNER JOIN form f ON f.id_form = con_rut.id_form
					INNER JOIN (
					    -- Paso 2: Obtener la respuesta de Distracción (Pregunta 197 = 'Si')
					    SELECT fr.id_form, fr.respuesta
					    FROM form_res fr
					    WHERE fr.id_encuesta = 11 AND fr.id_pregunta = 197 AND fr.respuesta = 'Si'
					) fr_distractor ON fr_distractor.id_form = f.id_form
					WHERE
					    c.rut_conductor='$rut_conductor'";

		//echo $sql;

		return ejecutarConsulta($sql);
	}

	public function girosSobrePeso($fecha,$id_base){

		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				INNER JOIN conductor c ON c.id_conductor = p.id_conductor
				INNER JOIN guia g ON g.id_programa = p.id_programa
				INNER JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				INNER JOIN ruta r ON r.id_ruta = p.id_ruta
				INNER JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE p.id_estado_programa = 6 AND p.id_base = '$id_base' AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000
				  AND p.fechaTurno_programa = '$fecha'  AND g.peso_guia > 46000";


		//echo $sql;

		return ejecutarConsulta($sql);
	}
	public function girosBajoPeso($fecha,$id_base){

		$sql="SELECT ep.*, e.sigla_equipo, cl.nombre_cliente, pr.nombre_producto, r.origen_ruta, r.destino_ruta, g.peso_guia, g.numero_guia, g.unidad_guia, p.*,
				       UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor, b.bajo_peso
				FROM programa p 
				INNER JOIN equipo e ON e.id_equipo = p.id_equipo
				INNER JOIN conductor c ON c.id_conductor = p.id_conductor
				INNER JOIN guia g ON g.id_programa = p.id_programa
				INNER JOIN clientev2 cl ON cl.id_cliente = p.id_clientev2
				INNER JOIN ruta r ON r.id_ruta = p.id_ruta
				INNER JOIN producto pr ON pr.id_producto = p.id_producto
				INNER JOIN base b ON b.id_base = p.id_base
				INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				WHERE p.id_estado_programa = 6 AND p.id_base = '$id_base' AND g.unidad_guia = 'KG' AND g.peso_guia >= 32000
				  AND p.fechaTurno_programa = '$fecha'  AND g.peso_guia < b.bajo_peso";


		//echo $sql;

		return ejecutarConsulta($sql);
	}


	public function listarPrograma($fecha,$fecha_hora_programa){

		$sql="SELECT
				    t1.fecha,
				    t1.id_base,
				    t1.nombre_base,
				    t1.giros_totales,
				    t1.giros_en_proceso,
				    t1.giros_finalizados,
				    t1.giros_extras,
					di.giros_actuales,
				    IFNULL(s_counts.giros_suspendido_externo, 0) AS giros_suspendido_externo,
				    IFNULL(s_counts.giros_suspendido_interno, 0) AS giros_suspendido_interno,
					x.equipos
				FROM 
				    (
				        SELECT
				            p.fechaTurno_programa AS fecha,
				            b.id_base,
				            b.nombre_base,
				            COUNT(p.id_programa) AS giros_totales,
				            SUM(CASE WHEN ep.op_estado_programa = 'OP' THEN 1 ELSE 0 END) AS giros_en_proceso,
				            SUM(CASE WHEN ep.op_estado_programa = 'FIN' THEN 1 ELSE 0 END) AS giros_finalizados,
				            SUM(CASE WHEN p.viajeExtra_programa = 1 THEN 1 ELSE 0 END) AS giros_extras
				        FROM programa p
				       
				        INNER JOIN base b ON b.id_base = p.id_base
				        INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				        WHERE 
				            p.fechaTurno_programa = '$fecha'
				        GROUP BY 
				            p.fechaTurno_programa, 
				            b.id_base, 
				            b.nombre_base
				    ) t1
				LEFT JOIN
				    ( 
				        SELECT
				            p.id_base,
				            p.fechaTurno_programa AS fecha,
				            SUM(CASE WHEN j.respon_justificacion = 'EXT' THEN 1 ELSE 0 END) AS giros_suspendido_externo,
				            SUM(CASE WHEN j.respon_justificacion = 'INT' THEN 1 ELSE 0 END) AS giros_suspendido_interno
				        FROM programa p
				        INNER JOIN suspender s ON s.id_programa = p.id_programa
				        INNER JOIN justificacion j ON j.id_justificacion = s.id_justificacion
				        WHERE
				            p.fechaTurno_programa = '$fecha'
				            AND p.id_estado_programa = 7
				        GROUP BY
				            p.id_base,
				            p.fechaTurno_programa
				    ) s_counts ON t1.id_base = s_counts.id_base AND t1.fecha = s_counts.fecha
					
                    LEFT JOIN (
                    
                    	SELECT 
                            b.nombre_base,
                        b.id_base,
                            COUNT(DISTINCT e.id_equipo) as equipos
                            
                            
                            FROM programa p 
                        
                        	INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            
                            WHERE p.fechaTurno_programa ='$fecha'
                            AND ep.op_estado_programa  IN ('OP','FIN') 
                        
                        GROUP BY b.id_base
                    ) x ON x.id_base = t1.id_base
					     LEFT JOIN (
                    
				        SELECT
				            p.fechaTurno_programa AS fecha,
				            b.id_base,
				            b.nombre_base,
				            COUNT(p.id_programa) AS giros_actuales
				           
				        FROM programa p
				       
				        INNER JOIN base b ON b.id_base = p.id_base
				        INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
				        WHERE 
				            p.horarioOrigen_programa BETWEEN '$fecha 00:00:00' AND '$fecha_hora_programa'
				        GROUP BY 
				            p.fechaTurno_programa, 
				            b.id_base, 
				            b.nombre_base
                    
                    )di ON di.id_base = t1.id_base AND di.fecha = t1.fecha";
				
//echo $sql;
				
	return ejecutarConsulta($sql);
	}



	public function equiposTurnoDia($id_base,$fecha,$fecha_hora){

	$sql=" SELECT e.id_equipo, e.sigla_equipo, e.patente_equipo , g.giro_equipo,nd.disponible,
				nd.nombre_estado_no_dispo,dis.nombre_estado_equipo,dis.op_estado_equipo,dis.color_estado_equipo ,dis.disponible_equipo_dia,
				dis.ini_dia, dis.fin_dia,dis.conductor_dia,dis.conductor_noc
				  FROM equipo e 

	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
   	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
  	INNER JOIN base b ON b.id_base= c.id_base AND	b.id_base='$id_base'

	LEFT JOIN (
        
        	SELECT  j.nombre_jornada_regimen,e.sigla_equipo,e.patente_equipo,e.id_equipo,
			COUNT(p.id_programa) as giro_equipo

				FROM programa p 

							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            INNER JOIN jornada_regimen j ON j.id_jornada_regimen = p.id_jornada_regimen
                            WHERE p.fechaTurno_programa ='$fecha'
                            AND ep.op_estado_programa  IN ('OP','FIN')  AND j.nombre_jornada_regimen='DIA'

				GROUP BY e.id_equipo
              ) g ON g.id_equipo = e.id_equipo
              
   LEFT JOIN (
   				SELECT e.id_equipo, e.patente_equipo, aux2.nombre_estado_equipo  as nombre_estado_no_dispo, 
					   aux2.color_estado_equipo, aux2.disponible, aux2.nombre_jornada_regimen, aux2.fecha_dispo,
					   IF(aux2.disponible = 1, 'bag-soft-green', 'bag-soft-red') as color_disponible, aux2.id_dispo,
	                   IF(DATE(aux.fecha) < DATE(now()), 1, 0) as dia_vencido,
		               CONCAT('CH',e.sigla_equipo) as ch
				FROM equipo e
				INNER JOIN 
					(
						SELECT e.id_equipo, e.sigla_equipo, c.id_contrato, j.id_jornada_regimen, j.nombre_jornada_regimen,
		                       CASE
		                            WHEN (HOUR('$fecha_hora') BETWEEN HOUR(j.ini_jornada_regimen) AND 23 AND 
		                                  j.nombre_jornada_regimen = 'DIA') THEN DATE('$fecha_hora')
		                            WHEN (HOUR('$fecha_hora') BETWEEN 0 AND HOUR(j.fin_jornada_regimen) AND 
		                                  j.nombre_jornada_regimen = 'DIA') THEN DATE('$fecha_hora' - INTERVAL 1 DAY)
		                            WHEN (HOUR('$fecha_hora') BETWEEN HOUR(j.ini_jornada_regimen) AND 23 AND 
		                                  j.nombre_jornada_regimen IN ('NOCHE','DIA')) THEN DATE('$fecha_hora')
		                            WHEN (HOUR('$fecha_hora') BETWEEN 0 AND HOUR(j.fin_jornada_regimen)) THEN DATE('$fecha_hora' - INTERVAL 1 DAY)
		                        END as fecha
		                FROM jornada_regimen j
		                INNER JOIN regimen r ON r.id_regimen = j.id_regimen
		                INNER JOIN contrato c ON c.id_regimen = r.id_regimen
		                INNER JOIN base b ON b.id_base = c.id_base
		                INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND 
		                                                 (DATE('$fecha_hora') BETWEEN ec.fecha_ini AND IFNULL(ec.fecha_fin, IF(DATE('$fecha_hora') > DATE(now()), DATE('$fecha_hora'), DATE(now())) ))
		                INNER JOIN equipo e ON e.id_equipo = ec.id_equipo
		                WHERE b.id_base = '$id_base' AND 
		                  ( CAST('$fecha_hora' AS time) BETWEEN j.ini_jornada_regimen AND j.fin_jornada_regimen OR 
		                   (NOT CAST('$fecha_hora' AS time) BETWEEN (j.fin_jornada_regimen + INTERVAL 1 MINUTE) AND 
		                    (j.ini_jornada_regimen - INTERVAL 1 MINUTE) AND j.ini_jornada_regimen > j.fin_jornada_regimen) )
		            ) as aux ON aux.id_equipo = e.id_equipo
                INNER JOIN (SELECT de.id_dispo, de.id_equipo, c.nombre_contrato, c.id_contrato, de.fecha_dispo, de.id_jornada_regimen,
                           	      ee.nombre_estado_equipo, ee.color_estado_equipo, de.disponible, j.nombre_jornada_regimen
					            FROM dispo_equipo de
                           		LEFT JOIN estado_equipo ee ON ee.id_estado_equipo = de.id_estado_equipo 
					            INNER JOIN contrato c ON c.id_contrato = de.id_contrato
					            INNER JOIN jornada_regimen j ON j.id_jornada_regimen = de.id_jornada_regimen
					            WHERE de.disponible = 0 
					          ) as aux2 ON aux2.id_equipo = e.id_equipo AND aux2.fecha_dispo = aux.fecha AND aux2.id_jornada_regimen = aux.id_jornada_regimen
				ORDER BY e.sigla_equipo ASC
   
   
   			) nd ON nd.id_equipo = e.id_equipo
            
            LEFT JOIN (
            SELECT e.id_equipo, e.id_base, e.sigla_equipo, e.siglaAlt_equipo, e.patente_equipo, e.marca_equipo, e.fecha, e.nombre_regimen,
								   e.nombre_contrato, e.id_contrato, e.nombre_jornada_regimen, e.id_jornada_regimen, e.nombre_cliente, 
							     ee.nombre_estado_equipo, ee.color_estado_equipo, ee.texto_estado_equipo, ee.op_estado_equipo,
								   IF(DATE(e.fecha) < DATE(now()), 1, 0) as dia_vencido,
								   '-----' as del1,
							     MAX(IF(j.nombre_jornada_regimen = 'DIA', de.id_dispo, '')) as id_dispo_equipo_dia,
									 MAX(IF(j.nombre_jornada_regimen = 'DIA', de.disponible, '')) as disponible_equipo_dia,
								   MAX(IF(j.nombre_jornada_regimen = 'DIA', cl.nombre_cliente, '')) as cliente_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_dispo, '')) as id_dispo_conductor_dia,
							     MAX(IF(jc.nombre_jornada_regimen = 'DIA', c.id_conductor, '')) as id_conductor_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))), '')) as conductor_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_contrato, '')) as id_contrato_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.fecha_dispo, '')) as fecha_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_equipo, '')) as id_equipo_dispo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_jornada_regimen, '')) as id_jornada_dispo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_jornada_equipo, '')) as id_jornada_equipo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.planta_dispo, '')) as planta_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', dr.id_dispo, '')) as id_dispo_remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.sigla_remolque, '')) as remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.patente_remolque, '')) as ptt_remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.id_remolque, '')) as id_remolque_dia,
								   IFNULL((SELECT jr.id_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as id_jornada_dia,
								   IFNULL((SELECT jr.ini_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as ini_dia,
								   IFNULL((SELECT jr.fin_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as fin_dia,
							       '-----' as del2,
								   MAX(IF(j.nombre_jornada_regimen = 'NOCHE', de.id_dispo, '')) as id_dispo_equipo_noc,
									 MAX(IF(j.nombre_jornada_regimen = 'NOCHE', de.disponible, '')) as disponible_equipo_noc,
								   MAX(IF(j.nombre_jornada_regimen = 'NOCHE', cl.nombre_cliente, '')) as cliente_noc,
							     MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_dispo, '')) as id_dispo_conductor_noc,
							     MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', c.id_conductor, '')) as id_conductor_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))), '')) as conductor_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_contrato, '')) as id_contrato_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.fecha_dispo, '')) as fecha_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_equipo, '')) as id_equipo_dispo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_jornada_regimen, '')) as id_jornada_dispo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_jornada_equipo, '')) as id_jornada_equipo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.planta_dispo, '')) as planta_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', dr.id_dispo, '')) as id_dispo_remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.sigla_remolque, '')) as remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.patente_remolque, '')) as ptt_remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.id_remolque, '')) as id_remolque_noc,
								   IFNULL((SELECT jr.id_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as id_jornada_noc,
								   IFNULL((SELECT jr.ini_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as ini_noc,
								   IFNULL((SELECT jr.fin_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as fin_noc
				FROM 
					(
			        SELECT e.id_equipo, b.id_base, e.sigla_equipo, e.siglaAlt_equipo, e.patente_equipo, e.marca_equipo, e.id_estado_equipo, r.id_regimen, r.nombre_regimen,
			               c.nombre_contrato, c.id_contrato, j.id_jornada_regimen, j.nombre_jornada_regimen, cl.nombre_cliente,
							       CASE  
					               when (HOUR('$fecha_hora') BETWEEN 16 AND 23) then DATE('$fecha_hora')
					               when (HOUR('$fecha_hora') BETWEEN 0 AND 5) then DATE_SUB(DATE('$fecha_hora'), INTERVAL 1 DAY)
					               when (HOUR('$fecha_hora') BETWEEN 6 AND 15) then DATE('$fecha_hora')
					           END as fecha
			      	FROM jornada_regimen j
			      	INNER JOIN regimen r ON r.id_regimen = j.id_regimen
			      	INNER JOIN contrato c ON c.id_regimen = r.id_regimen
			        INNER JOIN clientev2 cl ON cl.id_cliente = c.id_cliente
			      	INNER JOIN base b ON b.id_base = c.id_base
			      	#INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND ec.estado = 0
			      	INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND 
			      	                                 ( DATE('$fecha_hora') BETWEEN ec.fecha_ini AND IF(ec.fecha_fin IS NULL, IF('$fecha_hora' > DATE(NOW()), DATE('$fecha_hora'), DATE(NOW())), ec.fecha_fin) )
			      	INNER JOIN equipo e ON e.id_equipo = ec.id_equipo
			      	WHERE b.id_base = '$id_base' AND 
			      		  ( CAST('$fecha_hora' AS time) BETWEEN j.ini_jornada_regimen AND j.fin_jornada_regimen OR 
			       		  (NOT CAST('$fecha_hora' AS time) BETWEEN (j.fin_jornada_regimen + INTERVAL 1 MINUTE) AND 
			        	  (j.ini_jornada_regimen - INTERVAL 1 MINUTE) AND j.ini_jornada_regimen > j.fin_jornada_regimen) )
			    ) e
				INNER JOIN estado_equipo ee ON ee.id_estado_equipo = e.id_estado_equipo
				LEFT JOIN dispo_equipo de ON de.id_equipo = e.id_equipo AND de.fecha_dispo = e.fecha
				LEFT JOIN jornada_regimen j ON j.id_jornada_regimen = de.id_jornada_regimen
				LEFT JOIN clientev2 cl ON cl.id_cliente = de.id_cliente
				LEFT JOIN dispo_conductor dc ON dc.fecha_dispo = de.fecha_dispo AND dc.id_equipo = de.id_equipo
				LEFT JOIN jornada_regimen jc ON jc.id_jornada_regimen = dc.id_jornada_regimen
				LEFT JOIN conductor c ON c.id_conductor = dc.id_conductor
				LEFT JOIN dispo_remolque dr ON dr.fecha_dispo = de.fecha_dispo AND dr.id_equipo = de.id_equipo
				LEFT JOIN jornada_regimen jr ON jr.id_jornada_regimen = dr.id_jornada_regimen
				LEFT JOIN remolque rm ON rm.id_remolque = dr.id_remolque
				GROUP BY e.id_equipo
            
            
            
            
            
            )dis ON dis.id_equipo = e.id_equipo";	
//echo $sql;
		return ejecutarConsulta($sql);
	

	}
	public function equiposTurnoNoche($id_base,$fecha,$fecha_hora){

	$sql=" SELECT e.id_equipo, e.sigla_equipo, e.patente_equipo , g.giro_equipo,nd.disponible,
				nd.nombre_estado_no_dispo,dis.nombre_estado_equipo,dis.op_estado_equipo,dis.color_estado_equipo ,dis.disponible_equipo_noc,
				dis.ini_noc, dis.fin_noc,dis.conductor_dia,dis.conductor_noc
				  FROM equipo e 

	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
   	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
  	INNER JOIN base b ON b.id_base= c.id_base AND	b.id_base='$id_base'

	LEFT JOIN (
        
        	SELECT  j.nombre_jornada_regimen,e.sigla_equipo,e.patente_equipo,e.id_equipo,
			COUNT(p.id_programa) as giro_equipo

				FROM programa p 

							INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            INNER JOIN jornada_regimen j ON j.id_jornada_regimen = p.id_jornada_regimen
                            WHERE p.fechaTurno_programa ='$fecha'
                            AND ep.op_estado_programa  IN ('OP','FIN')  AND j.nombre_jornada_regimen='NOCHE'

				GROUP BY e.id_equipo
              ) g ON g.id_equipo = e.id_equipo
              
   LEFT JOIN (
   				SELECT e.id_equipo, e.patente_equipo, aux2.nombre_estado_equipo  as nombre_estado_no_dispo, 
					   aux2.color_estado_equipo, aux2.disponible, aux2.nombre_jornada_regimen, aux2.fecha_dispo,
					   IF(aux2.disponible = 1, 'bag-soft-green', 'bag-soft-red') as color_disponible, aux2.id_dispo,
	                   IF(DATE(aux.fecha) < DATE(now()), 1, 0) as dia_vencido,
		               CONCAT('CH',e.sigla_equipo) as ch
				FROM equipo e
				INNER JOIN 
					(
						SELECT e.id_equipo, e.sigla_equipo, c.id_contrato, j.id_jornada_regimen, j.nombre_jornada_regimen,
		                       CASE
		                            WHEN (HOUR('$fecha_hora') BETWEEN HOUR(j.ini_jornada_regimen) AND 23 AND 
		                                  j.nombre_jornada_regimen = 'DIA') THEN DATE('$fecha_hora')
		                            WHEN (HOUR('$fecha_hora') BETWEEN 0 AND HOUR(j.fin_jornada_regimen) AND 
		                                  j.nombre_jornada_regimen = 'DIA') THEN DATE('$fecha_hora' - INTERVAL 1 DAY)
		                            WHEN (HOUR('$fecha_hora') BETWEEN HOUR(j.ini_jornada_regimen) AND 23 AND 
		                                  j.nombre_jornada_regimen IN ('NOCHE','DIA')) THEN DATE('$fecha_hora')
		                            WHEN (HOUR('$fecha_hora') BETWEEN 0 AND HOUR(j.fin_jornada_regimen)) THEN DATE('$fecha_hora' - INTERVAL 1 DAY)
		                        END as fecha
		                FROM jornada_regimen j
		                INNER JOIN regimen r ON r.id_regimen = j.id_regimen
		                INNER JOIN contrato c ON c.id_regimen = r.id_regimen
		                INNER JOIN base b ON b.id_base = c.id_base
		                INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND 
		                                                 (DATE('$fecha_hora') BETWEEN ec.fecha_ini AND IFNULL(ec.fecha_fin, IF(DATE('$fecha_hora') > DATE(now()), DATE('$fecha_hora'), DATE(now())) ))
		                INNER JOIN equipo e ON e.id_equipo = ec.id_equipo
		                WHERE b.id_base = '$id_base' AND 
		                  ( CAST('$fecha_hora' AS time) BETWEEN j.ini_jornada_regimen AND j.fin_jornada_regimen OR 
		                   (NOT CAST('$fecha_hora' AS time) BETWEEN (j.fin_jornada_regimen + INTERVAL 1 MINUTE) AND 
		                    (j.ini_jornada_regimen - INTERVAL 1 MINUTE) AND j.ini_jornada_regimen > j.fin_jornada_regimen) )
		            ) as aux ON aux.id_equipo = e.id_equipo
                INNER JOIN (SELECT de.id_dispo, de.id_equipo, c.nombre_contrato, c.id_contrato, de.fecha_dispo, de.id_jornada_regimen,
                           	      ee.nombre_estado_equipo, ee.color_estado_equipo, de.disponible, j.nombre_jornada_regimen
					            FROM dispo_equipo de
                           		LEFT JOIN estado_equipo ee ON ee.id_estado_equipo = de.id_estado_equipo 
					            INNER JOIN contrato c ON c.id_contrato = de.id_contrato
					            INNER JOIN jornada_regimen j ON j.id_jornada_regimen = de.id_jornada_regimen
					            WHERE de.disponible = 0 
					          ) as aux2 ON aux2.id_equipo = e.id_equipo AND aux2.fecha_dispo = aux.fecha AND aux2.id_jornada_regimen = aux.id_jornada_regimen
				ORDER BY e.sigla_equipo ASC
   
   
   			) nd ON nd.id_equipo = e.id_equipo
            
            LEFT JOIN (
            SELECT e.id_equipo, e.id_base, e.sigla_equipo, e.siglaAlt_equipo, e.patente_equipo, e.marca_equipo, e.fecha, e.nombre_regimen,
								   e.nombre_contrato, e.id_contrato, e.nombre_jornada_regimen, e.id_jornada_regimen, e.nombre_cliente, 
							     ee.nombre_estado_equipo, ee.color_estado_equipo, ee.texto_estado_equipo, ee.op_estado_equipo,
								   IF(DATE(e.fecha) < DATE(now()), 1, 0) as dia_vencido,
								   '-----' as del1,
							     MAX(IF(j.nombre_jornada_regimen = 'DIA', de.id_dispo, '')) as id_dispo_equipo_dia,
									 MAX(IF(j.nombre_jornada_regimen = 'DIA', de.disponible, '')) as disponible_equipo_dia,
								   MAX(IF(j.nombre_jornada_regimen = 'DIA', cl.nombre_cliente, '')) as cliente_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_dispo, '')) as id_dispo_conductor_dia,
							     MAX(IF(jc.nombre_jornada_regimen = 'DIA', c.id_conductor, '')) as id_conductor_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))), '')) as conductor_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_contrato, '')) as id_contrato_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.fecha_dispo, '')) as fecha_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_equipo, '')) as id_equipo_dispo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_jornada_regimen, '')) as id_jornada_dispo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.id_jornada_equipo, '')) as id_jornada_equipo_dia,
								   MAX(IF(jc.nombre_jornada_regimen = 'DIA', dc.planta_dispo, '')) as planta_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', dr.id_dispo, '')) as id_dispo_remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.sigla_remolque, '')) as remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.patente_remolque, '')) as ptt_remolque_dia,
								   MAX(IF(jr.nombre_jornada_regimen = 'DIA', rm.id_remolque, '')) as id_remolque_dia,
								   IFNULL((SELECT jr.id_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as id_jornada_dia,
								   IFNULL((SELECT jr.ini_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as ini_dia,
								   IFNULL((SELECT jr.fin_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'DIA' AND jr.id_regimen = e.id_regimen), '') as fin_dia,
							       '-----' as del2,
								   MAX(IF(j.nombre_jornada_regimen = 'NOCHE', de.id_dispo, '')) as id_dispo_equipo_noc,
									 MAX(IF(j.nombre_jornada_regimen = 'NOCHE', de.disponible, '')) as disponible_equipo_noc,
								   MAX(IF(j.nombre_jornada_regimen = 'NOCHE', cl.nombre_cliente, '')) as cliente_noc,
							     MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_dispo, '')) as id_dispo_conductor_noc,
							     MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', c.id_conductor, '')) as id_conductor_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))), '')) as conductor_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_contrato, '')) as id_contrato_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.fecha_dispo, '')) as fecha_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_equipo, '')) as id_equipo_dispo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_jornada_regimen, '')) as id_jornada_dispo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.id_jornada_equipo, '')) as id_jornada_equipo_noc,
								   MAX(IF(jc.nombre_jornada_regimen = 'NOCHE', dc.planta_dispo, '')) as planta_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', dr.id_dispo, '')) as id_dispo_remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.sigla_remolque, '')) as remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.patente_remolque, '')) as ptt_remolque_noc,
								   MAX(IF(jr.nombre_jornada_regimen = 'NOCHE', rm.id_remolque, '')) as id_remolque_noc,
								   IFNULL((SELECT jr.id_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as id_jornada_noc,
								   IFNULL((SELECT jr.ini_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as ini_noc,
								   IFNULL((SELECT jr.fin_jornada_regimen FROM jornada_regimen jr WHERE jr.nombre_jornada_regimen = 'NOCHE' AND jr.id_regimen = e.id_regimen), '') as fin_noc
				FROM 
					(
			        SELECT e.id_equipo, b.id_base, e.sigla_equipo, e.siglaAlt_equipo, e.patente_equipo, e.marca_equipo, e.id_estado_equipo, r.id_regimen, r.nombre_regimen,
			               c.nombre_contrato, c.id_contrato, j.id_jornada_regimen, j.nombre_jornada_regimen, cl.nombre_cliente,
							       CASE  
					               when (HOUR('$fecha_hora') BETWEEN 16 AND 23) then DATE('$fecha_hora')
					               when (HOUR('$fecha_hora') BETWEEN 0 AND 5) then DATE_SUB(DATE('$fecha_hora'), INTERVAL 1 DAY)
					               when (HOUR('$fecha_hora') BETWEEN 6 AND 15) then DATE('$fecha_hora')
					           END as fecha
			      	FROM jornada_regimen j
			      	INNER JOIN regimen r ON r.id_regimen = j.id_regimen
			      	INNER JOIN contrato c ON c.id_regimen = r.id_regimen
			        INNER JOIN clientev2 cl ON cl.id_cliente = c.id_cliente
			      	INNER JOIN base b ON b.id_base = c.id_base
			      	#INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND ec.estado = 0
			      	INNER JOIN equipo_contrato ec ON ec.id_contrato = c.id_contrato AND 
			      	                                 ( DATE('$fecha_hora') BETWEEN ec.fecha_ini AND IF(ec.fecha_fin IS NULL, IF('$fecha_hora' > DATE(NOW()), DATE('$fecha_hora'), DATE(NOW())), ec.fecha_fin) )
			      	INNER JOIN equipo e ON e.id_equipo = ec.id_equipo
			      	WHERE b.id_base = '$id_base' AND 
			      		  ( CAST('$fecha_hora' AS time) BETWEEN j.ini_jornada_regimen AND j.fin_jornada_regimen OR 
			       		  (NOT CAST('$fecha_hora' AS time) BETWEEN (j.fin_jornada_regimen + INTERVAL 1 MINUTE) AND 
			        	  (j.ini_jornada_regimen - INTERVAL 1 MINUTE) AND j.ini_jornada_regimen > j.fin_jornada_regimen) )
			    ) e
				INNER JOIN estado_equipo ee ON ee.id_estado_equipo = e.id_estado_equipo
				LEFT JOIN dispo_equipo de ON de.id_equipo = e.id_equipo AND de.fecha_dispo = e.fecha
				LEFT JOIN jornada_regimen j ON j.id_jornada_regimen = de.id_jornada_regimen
				LEFT JOIN clientev2 cl ON cl.id_cliente = de.id_cliente
				LEFT JOIN dispo_conductor dc ON dc.fecha_dispo = de.fecha_dispo AND dc.id_equipo = de.id_equipo
				LEFT JOIN jornada_regimen jc ON jc.id_jornada_regimen = dc.id_jornada_regimen
				LEFT JOIN conductor c ON c.id_conductor = dc.id_conductor
				LEFT JOIN dispo_remolque dr ON dr.fecha_dispo = de.fecha_dispo AND dr.id_equipo = de.id_equipo
				LEFT JOIN jornada_regimen jr ON jr.id_jornada_regimen = dr.id_jornada_regimen
				LEFT JOIN remolque rm ON rm.id_remolque = dr.id_remolque
				GROUP BY e.id_equipo
            
            
            
            
            
            )dis ON dis.id_equipo = e.id_equipo";
			
		//	echo $sql;

		return ejecutarConsulta($sql);
	}


	public function verEquiposprograma($fecha,$id_base){

		$sql="SELECT  b.nombre_base,
                        b.id_base,
						COUNT(p.id_programa) as giros,
                            e.*
                            
                            
                            FROM programa p 
                        
                        	INNER 	JOIN equipo e ON e.id_equipo = p.id_equipo
                        	INNER JOIN equipo_contrato eq ON eq.id_equipo = e.id_equipo AND eq.estado=0
                        	INNER JOIN contrato c ON c.id_contrato = eq.id_contrato
                        	INNER JOIN base b ON b.id_base= c.id_base AND	b.id_base='$id_base'
                            INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                            
                            WHERE p.fechaTurno_programa ='$fecha' AND ep.op_estado_programa  IN ('OP','FIN')
							        GROUP BY e.id_equipo";




		return ejecutarConsulta($sql);
	}

	public function listarTiemposEsperaPorId($id_base,$fecha){
		$sql="SELECT
				            cc.id_base,
                            l.*,
				            cc.nombre_base,
				            l.fecha AS fecha_libreta,
				            SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_total_segundos,
				            SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tiempo_espera_total_formato
				        FROM
				            (
				                SELECT
                                	l.libreta_id,
				                    l.libreta_id_conductor,
				                    l.libreta_fecha_inicio,
				                    l.libreta_fecha_fin,
				                    l.fecha
				                FROM libreta_jornada_detalle l
				                WHERE l.fecha = '$fecha'
				                  AND l.libreta_tarea = 'Tiempo de espera'
				                  AND l.libreta_estado = 1
				                  
				            ) l
				        INNER JOIN
				            (
				                SELECT
				                    c.id_conductor,
				                    b.nombre_base,
				                    co.id_base,
				                    cc.fecha_ini,
				                    IFNULL(cc.fecha_fin, DATE(NOW())) AS fecha_fin
				                FROM conductor_contrato cc
				                INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
				                INNER JOIN conductor c ON c.id_conductor = cc.id_conductor
				                INNER JOIN base b ON b.id_base = co.id_base AND b.id_base='$id_base'
				        ) cc ON l.libreta_id_conductor = cc.id_conductor
				        WHERE (l.fecha BETWEEN cc.fecha_ini AND cc.fecha_fin)
				        GROUP BY l.libreta_id";

						return ejecutarConsulta($sql);
	}


	public function listarTiemposEsperaBase($id_base, $fecha){

		$sqlold="SELECT 
					    l.*, 
						    (TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_total_segundos,
				            SEC_TO_TIME((TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tiempo_espera_total_formato ,
					    c.rut_conductor, 
						c.id_conductor,
						c.nombre_base,
					    co.nombre_contrato, 
						  UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor,
					    b.nombre_base
					FROM libreta_jornada_detalle l
					INNER JOIN conductor c ON c.id_conductor = l.libreta_id_conductor
					INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor  
					INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
					INNER JOIN base b ON b.id_base = co.id_base
					WHERE 
					    l.libreta_tarea = 'Tiempo de espera'
					    AND l.libreta_estado = 1
					    AND l.fecha = '$fecha'
					    AND b.id_base = '$id_base'
					    AND '$fecha' BETWEEN cc.fecha_ini AND IFNULL(cc.fecha_fin, NOW())
					    AND cc.estado = 0";


		$sql="SELECT 
				    g.giros,
				    c.id_base,
				    c.*
				FROM 
				(
				    SELECT 
				        l.*, 
				        SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_total_segundos,
				        SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tiempo_espera_total_formato,
				        c.rut_conductor, 
				        co.nombre_contrato, 
				        c.id_conductor,
				        UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) AS conductor,
				        b.nombre_base,
				        b.id_base
				    FROM 
				        libreta_jornada_detalle l
				    INNER JOIN 
				        conductor c ON c.id_conductor = l.libreta_id_conductor
				    INNER JOIN 
				        conductor_contrato cc ON cc.id_conductor = c.id_conductor  
				    INNER JOIN 
				        contrato co ON co.id_contrato = cc.id_contrato
				    INNER JOIN 
				        base b ON b.id_base = co.id_base
				    WHERE 
				        l.libreta_tarea = 'Tiempo de espera'
				        AND l.libreta_estado = 1
				        AND l.fecha = '$fecha'
				        AND b.id_base = '$id_base'
				        AND '$fecha' BETWEEN cc.fecha_ini AND IFNULL(cc.fecha_fin, NOW())
				        AND cc.estado = 0        
				    GROUP BY 
				        c.id_conductor
				) c
				LEFT JOIN 
				(
				    SELECT 
				        id_conductor,
				        COUNT(id_programa) AS giros
				    FROM 
				        programa
				    WHERE 
				        fechaTurno_programa ='$fecha'
				    GROUP BY 
				        id_conductor
				) g ON g.id_conductor = c.id_conductor
				ORDER BY 
				    c.id_conductor";


//echo $sql;
		return ejecutarConsulta($sql);
	}



	public function listarTiemposEsperaRut($rut_conductor, $fecha){


		$sql="SELECT l.*,
					UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) AS conductor,
					TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin) AS tiempo_espera_segundos,
    				SEC_TO_TIME(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_formato 
					FROM libreta_jornada_detalle l 
					LEFT JOIN conductor c ON c.rut_conductor = l.libreta_rut
					WHERE l.libreta_rut='$rut_conductor' 
					AND l.fecha='$fecha' AND 
					l.libreta_tarea = 'Tiempo de espera'
					AND l.libreta_estado='1'";

		return ejecutarConsulta($sql);
	}

	  public function listarPalancaTpoEspera($id_base, $fecha,$fecha_ini,$fecha_fin)
    {
    
     
			$sql="SELECT 
					UPPER(CONCAT(c.apellidoPat_conductor,' ',c.apellidoMat_conductor,' ',SUBSTRING_INDEX(c.nombre_conductor,' ',1))) as conductor,
							                           b.nombre_base, c.rut_conductor,te.*,p.*
							                    FROM conductor c 
                 							      INNER JOIN cargos ca ON ca.id_cargo = c.id_cargo AND ca.area_cargo = 'conductor'
                   							      INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor AND '$fecha' BETWEEN cc.fecha_ini AND IFNULL(cc.fecha_fin, DATE(NOW()))
                  								  INNER JOIN contrato co ON co.id_contrato = cc.id_contrato
                  								  INNER JOIN base b ON b.id_base = co.id_base  AND b.id_base='$id_base'
                                                LEFT JOIN 
    													(
                                                            SELECT  c.id_conductor,c.rut_conductor, 
                                                             SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tpo_espera,
													SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tpo_espera_f,
                                                            l.libreta_patente_movil
												
														FROM conductor c 
                                                  
                                                   INNER JOIN libreta_jornada_detalle l ON l.libreta_rut = c.rut_conductor
                                                
                                                WHERE  l.libreta_fecha_inicio >= '$fecha_ini'
												    AND l.libreta_fecha_inicio <= '$fecha_fin'
												     AND l.libreta_tarea = 'Tiempo de espera'
												    AND l.libreta_estado = 1
                                                  
                                                    GROUP BY c.id_conductor          
                                                        )te ON te.id_conductor = c.id_conductor  
							      LEFT JOIN 
							                (
												SELECT p.id_conductor, COUNT(p.id_programa) as giros
                 								   FROM programa p 
										INNER JOIN estado_programa ep ON ep.id_estado_programa = p.id_estado_programa
                  					    INNER JOIN base b ON b.id_base = p.id_base AND b.id_base='$id_base'
                 					   WHERE ep.op_estado_programa IN ('OP','FIN') AND p.fechaTurno_programa = '$fecha'  
                  					  GROUP BY p.id_conductor
							                ) p ON p.id_conductor = c.id_conductor  ";
      

	 // echo $sql;
      return ejecutarConsulta($sql);
    }

	   public function listarLibretaDetalle($rut, $fecha,$fecha_ini,$fecha_fin)
    {
      $sql = "  SELECT  c.id_conductor,c.rut_conductor, 
                	    SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_segundos,
						SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tiempo_espera_formato,
                                                            l.*
												
														FROM conductor c 
                                                  
                                                   INNER JOIN libreta_jornada_detalle l ON l.libreta_rut = c.rut_conductor
                                                
                                                WHERE  l.libreta_fecha_inicio >= '$fecha_ini'
												    AND l.libreta_fecha_inicio <= '$fecha_fin'
												     AND l.libreta_tarea = 'Tiempo de espera'
												    AND l.libreta_estado = 1
                                                  	AND l.libreta_rut = '$rut'
                                                    GROUP BY l.libreta_id  	";
		//echo $sql;
      return ejecutarConsulta($sql); 
    }
	public function listarTiemposEspera($fecha,$fecha_ini,$fecha_fin){



					$sql="	SELECT te.*,x.* 
									FROM (
									
												SELECT
												    b.id_base as base ,b.nombre_base,
													'$fecha' AS fecha_muestra,
												    SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin)) AS tiempo_espera_total_segundos,
													SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, l.libreta_fecha_inicio, l.libreta_fecha_fin))) AS tiempo_espera_total_formato
												FROM libreta_jornada_detalle l
																	INNER JOIN conductor c ON c.id_conductor = l.libreta_id_conductor
																	INNER JOIN conductor_contrato cc ON cc.id_conductor = c.id_conductor  
																	INNER JOIN contrato co ON co.id_contrato = cc.id_contrato  AND DATE('$fecha') BETWEEN cc.fecha_ini AND IFNULL(cc.fecha_fin, NOW())
																	INNER JOIN base b ON b.id_base = co.id_base 

												WHERE
												    l.libreta_fecha_inicio >= '$fecha_ini'
												    AND l.libreta_fecha_inicio <= '$fecha_fin'
												     AND l.libreta_tarea = 'Tiempo de espera'
												    AND l.libreta_estado = 1


												    GROUP BY b.id_base

											
										) te
											
											
										LEFT JOIN
														    (
														        SELECT p.fechaTurno_programa AS fecha, 
														            COUNT(p.id_programa) AS giros_totales, 
														          
														            b.id_base
														        FROM programa p
														       INNER JOIn contrato co 	ON p.id_contrato = co.id_contrato
														       INNER JOIN estado_programa e ON e.id_estado_programa = p.id_estado_programa
										                        INNER JOIN base b ON b.id_base = p.id_base
																
														        WHERE ( e.op_estado_programa='OP' OR e.op_estado_programa = 'FIN') 
														          AND p.fechaTurno_programa BETWEEN '$fecha' AND '$fecha'
														        GROUP BY fecha, b.id_base, b.nombre_base
														    ) x ON x.id_base = te.base AND x.fecha = te.fecha_muestra";

//echo $sql;
				return ejecutarConsulta($sql);
	}


	public function listarBajoPeso($fecha){

		$sql2="SELECT
				    'VIAJES BAJO PESO' AS item,
				    cal.fecha,

				    COALESCE(p.nombre_base, x.nombre_base) AS nombre_base_actividad, 
				    IFNULL(p.valor, 0) AS bajo_peso,
				    IFNULL(x.giros, 0) AS giros,
					x.id_base

				FROM calendar cal

				LEFT JOIN (
				    SELECT
				        p.fechaTurno_programa AS fecha, 
				        COUNT(p.id_programa) AS giros, 
				        b.nombre_base, 
				        b.id_base
				    FROM programa p
				    LEFT JOIN base b ON b.id_base = p.id_base
				    WHERE p.id_estado_programa = 6 
				      AND p.fechaTurno_programa BETWEEN '$fecha' AND '$fecha'
					    AND b.id_base NOT IN (4,12,24)
				    GROUP BY fecha, b.id_base, b.nombre_base
				) x ON x.fecha = cal.fecha 
				LEFT JOIN (
				    SELECT
				        p.fechaTurno_programa AS fecha, 
				        COUNT(p.id_programa) AS valor, 
				        b.nombre_base, 
				        b.id_base
				    FROM programa p
				    LEFT JOIN guia g ON g.id_programa = p.id_programa
				    LEFT JOIN base b ON b.id_base = p.id_base
				    WHERE p.id_estado_programa = 6 
				      AND g.unidad_guia = 'KG' 
				      AND g.peso_guia >= 32000 
				      AND p.fechaTurno_programa BETWEEN '$fecha' AND '$fecha' 
				      AND g.peso_guia < b.bajo_peso 
					  AND b.id_base NOT IN (4,12,24)
				    GROUP BY fecha, b.id_base, b.nombre_base
				) p ON cal.fecha = p.fecha AND p.id_base = x.id_base 
				WHERE cal.fecha BETWEEN '$fecha' AND '$fecha'

				GROUP BY nombre_base_actividad, item, cal.fecha";


			$sql="SELECT
   

						    b.nombre_base AS nombre_base_actividad,
						    IFNULL(p.valor, 0) AS bajo_peso,
						    IFNULL(p2.valor, 0) AS sobre_peso,
						    IFNULL(x.giros, 0) AS giros,
						    b.id_base
						FROM base b
						LEFT JOIN (

						    SELECT
						        p.fechaTurno_programa AS fecha,
						        COUNT(p.id_programa) AS giros,
						        p.id_base
						    FROM programa p
						    WHERE p.id_estado_programa = 6
						      AND p.fechaTurno_programa BETWEEN '$fecha' AND '$fecha'
						    GROUP BY p.fechaTurno_programa, p.id_base
						) x ON x.id_base = b.id_base
						LEFT JOIN (
						    SELECT
						        p_inner.fechaTurno_programa AS fecha,
						        COUNT(p_inner.id_programa) AS valor,
						        p_inner.id_base
						    FROM programa p_inner
						    INNER JOIN guia g ON g.id_programa = p_inner.id_programa
						    WHERE p_inner.id_estado_programa = 6
						      AND g.unidad_guia = 'KG'
						      AND g.peso_guia >= 32000
						      AND p_inner.fechaTurno_programa = '$fecha' 
						      AND g.peso_guia < (SELECT b_corr.bajo_peso FROM base b_corr WHERE b_corr.id_base = p_inner.id_base)
						    GROUP BY p_inner.fechaTurno_programa, p_inner.id_base
						) p ON p.id_base = b.id_base AND p.fecha = x.fecha
						
            	LEFT JOIN (
						    SELECT
						        p_inner.fechaTurno_programa AS fecha,
						        COUNT(p_inner.id_programa) AS valor,
						        p_inner.id_base
						    FROM programa p_inner
						    INNER JOIN guia g ON g.id_programa = p_inner.id_programa
						    WHERE p_inner.id_estado_programa = 6
						      AND g.unidad_guia = 'KG'
						      AND g.peso_guia >= 32000
						      AND p_inner.fechaTurno_programa = '$fecha' 
						      AND g.peso_guia > 46000
						    GROUP BY p_inner.fechaTurno_programa, p_inner.id_base
						) p2 ON p2.id_base = b.id_base AND p2.fecha = x.fecha
						WHERE
						    b.id_base NOT IN (4, 12, 24) AND b.estado_base=1
						ORDER BY b.nombre_base
						";


//echo $sql;
//revisar motivo suspendido

		return ejecutarConsulta($sql);
	}

}